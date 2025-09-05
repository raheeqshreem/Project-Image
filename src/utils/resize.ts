import sharp from 'sharp';


const resize = async (
  inputPath: string,
  outputPath: string,
  width: number,
  height: number
): Promise<void> => {
  await sharp(inputPath)
    .resize(width, height)
    .toFormat('jpeg') 
    .toFile(outputPath);
};

export default resize;