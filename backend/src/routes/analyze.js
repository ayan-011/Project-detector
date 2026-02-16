import multer from 'multer';
import { promises as fs } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { validateGitHubUrl, validateFileSize } from '../utils/validation.js';
import { GitHubService } from '../services/githubService.js';
import { ZipService } from '../services/zipService.js';
import { SimilarityService } from '../services/similarityService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = join(__dirname, '../../uploads');
    // Use sync mkdir with recursive option
    fs.mkdir(uploadDir, { recursive: true })
      .then(() => cb(null, uploadDir))
      .catch((error) => cb(error));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `project-${uniqueSuffix}.zip`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'application/x-zip',
      'application/octet-stream', // Some systems use this for ZIP files
    ];
    
    const isZipFile = allowedMimeTypes.includes(file.mimetype) || 
                      file.originalname.toLowerCase().endsWith('.zip');
    
    if (isZipFile) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
    }
  },
});

/**
 * Main analysis handler
 */
export const analyzeHandler = async (req, res, next) => {
  try {
    const { githubUrl } = req.body;
    const file = req.file;

    // Validate input
    if (!githubUrl && !file) {
      return res.status(400).json({
        error: 'Either GitHub URL or ZIP file is required',
      });
    }

    let files = [];

    // Process GitHub URL
    if (githubUrl) {
      const validation = validateGitHubUrl(githubUrl);
      if (!validation.valid) {
        return res.status(400).json({
          error: validation.error,
        });
      }

      const githubService = new GitHubService();
      const fileList = await githubService.fetchRepositoryContents(
        validation.owner,
        validation.repo
      );

      // Fetch content for each file (limit to first 50 files to avoid rate limits)
      for (const fileInfo of fileList.slice(0, 50)) {
        try {
          const content = await githubService.fetchFileContent(fileInfo.url);
          files.push({
            name: fileInfo.name,
            path: fileInfo.path,
            content: content,
          });
        } catch (error) {
          console.error(`Error fetching file ${fileInfo.name}:`, error.message);
        }
      }
    }

    // Process ZIP file
    if (file) {
      if (!validateFileSize(file.size)) {
        // Clean up uploaded file
        await fs.unlink(file.path).catch(() => {});
        return res.status(400).json({
          error: 'File size exceeds 10MB limit',
        });
      }

      const zipService = new ZipService();
      files = await zipService.extractZip(file.path);

      // Clean up uploaded file
      await fs.unlink(file.path).catch(() => {});
    }

    if (files.length === 0) {
      return res.status(400).json({
        error: 'No code files found in the provided source',
      });
    }

    // Analyze similarity
    const similarityService = new SimilarityService();
    const analysisResults = await similarityService.analyzeFiles(files);

    // Prepare response
    const response = {
      similarity: analysisResults.similarity,
      riskLevel: similarityService.getRiskLevel(analysisResults.similarity),
      matchedRepositories: analysisResults.matchedRepositories,
      matchedFiles: analysisResults.matchedFiles,
      totalFilesAnalyzed: analysisResults.totalFiles,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    // Clean up uploaded file if exists
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    next(error);
  }
};

// Export multer middleware for use in route
export const uploadMiddleware = upload.single('zipFile');
