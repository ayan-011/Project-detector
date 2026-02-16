import yauzl from 'yauzl';

const CODE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.json'];

/**
 * Service for extracting and reading zip files
 */
export class ZipService {
  /**
   * Extracts zip file and returns code files
   * @param {string} zipPath - Path to zip file
   * @returns {Promise<Array>} - Array of { name, path, content }
   */
  async extractZip(zipPath) {
    return new Promise((resolve, reject) => {
      const files = [];

      yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          return reject(new Error(`Failed to open zip file: ${err.message}`));
        }

        zipfile.readEntry();

        zipfile.on('entry', (entry) => {
          if (/\/$/.test(entry.fileName)) {
            // Directory entry, skip
            zipfile.readEntry();
            return;
          }

          // Check if it's a code file
          const isCodeFile = CODE_EXTENSIONS.some(ext =>
            entry.fileName.toLowerCase().endsWith(ext)
          );

          if (!isCodeFile) {
            zipfile.readEntry();
            return;
          }

          zipfile.openReadStream(entry, async (err, readStream) => {
            if (err) {
              zipfile.readEntry();
              return;
            }

            try {
              const content = await this.streamToString(readStream);
              files.push({
                name: entry.fileName.split('/').pop(),
                path: entry.fileName,
                content: content,
              });
              zipfile.readEntry();
            } catch (error) {
              console.error(`Error reading file ${entry.fileName}:`, error);
              zipfile.readEntry();
            }
          });
        });

        zipfile.on('end', () => {
          resolve(files);
        });

        zipfile.on('error', (err) => {
          reject(new Error(`Zip extraction error: ${err.message}`));
        });
      });
    });
  }

  /**
   * Converts stream to string
   * @param {ReadableStream} stream - Stream to convert
   * @returns {Promise<string>}
   */
  streamToString(stream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      stream.on('error', reject);
    });
  }
}
