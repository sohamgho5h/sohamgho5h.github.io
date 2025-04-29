const https = require('https');
const fs = require('fs');
const path = require('path');

const logos = {
  microsoft: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
  salesforce: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg',
  pwc: 'https://upload.wikimedia.org/wikipedia/commons/0/05/PricewaterhouseCoopers_Logo.svg',
  disney: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Disney%2B_logo.svg',
  mitsubishi: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Mitsubishi_logo.svg',
  'iim-calcutta': 'https://upload.wikimedia.org/wikipedia/en/1/1c/IIM_Calcutta_Logo.svg'
};

const downloadFile = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => reject(err));
      });
    }).on('error', reject);
  });
};

const main = async () => {
  const dir = path.join(process.cwd(), 'public', 'images', 'companies');
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  for (const [name, url] of Object.entries(logos)) {
    const filepath = path.join(dir, `${name}.svg`);
    console.log(`Downloading ${name} logo...`);
    try {
      await downloadFile(url, filepath);
      console.log(`Successfully downloaded ${name} logo`);
    } catch (error) {
      console.error(`Error downloading ${name} logo:`, error);
    }
  }
};

main().catch(console.error); 