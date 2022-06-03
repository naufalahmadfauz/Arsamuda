const {createReadStream}=require('fs');
const {BlobServiceClient} = require("@azure/storage-blob");

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_CONNECTION);
const containerClient = blobServiceClient.getContainerClient('percobaan');


const createAzureContainer = async (containerName)=>{
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const createContainerResponse = await containerClient.create();
    console.log(`Create container ${containerName} successfully`, createContainerResponse.requestId)
    return createContainerResponse
}

const listAzureContainers = async ()=>{
    return blobServiceClient.listContainers();
}

const uploadBlob = async (imagePath,pictureName)=>{
    const pic = createReadStream(imagePath, {highWaterMark: 8000000})
    const blockBlobClient = containerClient.getBlockBlobClient(pictureName);
    return await blockBlobClient.uploadStream(pic);
}
const listBlob = async ()=>{
    return containerClient.listBlobsFlat()
}
const downloadBlob = async (pictureName)=>{
    const blobClient = containerClient.getBlockBlobClient(pictureName);
    return (await blobClient.download(0)).readableStreamBody
}

const deleteBlob = async(pictureName)=>{
    const blobClient = containerClient.getBlockBlobClient(pictureName)
    return await blobClient.deleteIfExists({deleteSnapshots:"include"})
}

module.exports = {createAzureContainer,listAzureContainers,uploadBlob,listBlob,downloadBlob,deleteBlob}