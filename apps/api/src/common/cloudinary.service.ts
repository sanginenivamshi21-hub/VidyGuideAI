import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor() {
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    if (cloudinaryUrl) {
      cloudinary.config({
        cloudinary_url: cloudinaryUrl,
      });
    } else {
      this.logger.warn('CLOUDINARY_URL not configured. File uploads will fall back to mock urls.');
    }
  }

  async uploadFile(fileBuffer: Buffer, folder = 'vidyguide'): Promise<string> {
    if (!process.env.CLOUDINARY_URL) {
      this.logger.warn('Mocking Cloudinary file upload.');
      return `https://res.cloudinary.com/mock/image/upload/${folder}/mock_resume.pdf`;
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error) {
            this.logger.error(`Cloudinary upload failed: ${error.message}`);
            return reject(error);
          }
          resolve(result?.secure_url || '');
        }
      ).end(fileBuffer);
    });
  }
}
