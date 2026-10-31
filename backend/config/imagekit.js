import ImageKit from '@imagekit/nodejs';
import fs from 'fs';

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// To upload image
export const uploadImageKit = async (fileInput, fileName) => {
    try {
        let fileToUpload;
        if (Buffer.isBuffer(fileInput)) {
            fileToUpload = fileInput.toString('base64');
        } else if (typeof fileInput === 'string') {
            fileToUpload = fs.createReadStream(fileInput);
        } else {
            fileToUpload = fileInput;
        }

        const result = await imagekit.files.upload({
            file: fileToUpload,
            fileName: fileName,
            folder: '/employee_profiles'
        });

        return result;
    } catch (error) {
        console.error("ImageKit upload error details:", error);
        throw new Error(`Imagekit upload failed: ${error.message}`);
    }
};

// To delete image
export const deleteFromImagekit = async (url) => {
    try {
        if (!url || typeof url !== 'string' || !url.includes('ik.imagekit.io')) {
            return null;
        }

        // Clean query parameters and extract file name
        const cleanUrl = url.split('?')[0];
        const lastSlash = cleanUrl.lastIndexOf('/');
        const fileName = cleanUrl.substring(lastSlash + 1);

        if (!fileName) return null;

        // In @imagekit/nodejs, listing files uses files.list()
        // Defensive check accommodates both .files.list and .listFiles
        const listMethod = imagekit.files?.list 
            ? imagekit.files.list.bind(imagekit.files) 
            : (imagekit.listFiles ? imagekit.listFiles.bind(imagekit) : null);

        if (!listMethod) {
            console.error("ImageKit listing method not supported");
            return null;
        }

        const files = await listMethod({
            searchQuery: `name = "${fileName}"`
        });

        if (files && files.length > 0) {
            const targetFile = files[0];
            const fileId = targetFile.fileId || targetFile.id;

            if (fileId) {
                // Delete using files.delete or deleteFile
                if (imagekit.files?.delete) {
                    return await imagekit.files.delete(fileId);
                } else if (imagekit.deleteFile) {
                    return await imagekit.deleteFile(fileId);
                }
            }
        }

        return null;
    } catch (error) {
        console.error("ImageKit deletion failed:", error.message);
        return null;
    }
};

export default imagekit;