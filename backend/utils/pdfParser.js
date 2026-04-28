import { PDFParse } from 'pdf-parse';

/**
 * Extract text from a PDF buffer
 * @param {Buffer} buffer - PDF file buffer from multer memoryStorage
 * @returns {Promise<{text: string, numPages: number}>}
 */
export const extractTextFromPDF = async (buffer) => {
    try {
        // pdf-parse accepts either a URL or a buffer via the `data` option
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        await parser.destroy();

        return {
            text: result.text,
            numPages: result.numpage,
            info: result.info,
        };
    } catch (error) {
        console.error('PDF parsing error:', error);
        throw new Error('Failed to extract text from PDF');
    }
};