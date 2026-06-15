const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const XLSX = require('xlsx');

const dirPath = 'D:\\proudct dashboard pl final pl\\LATEST UPDATE PL BETA\\deploy_to_vercel\\file-we-app-2025\\update bl\\Camera Roll\\Camera Roll';
const outputExcel = 'D:\\proudct dashboard pl final pl\\LATEST UPDATE PL BETA\\deploy_to_vercel\\file-we-app-2025\\update bl\\scratch\\Extracted_Narrations.xlsx';

async function main() {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
    console.log(`Found ${files.length} images to process...`);
    
    const allNarrations = [];
    
    // We create a worker for faster processing
    const worker = await Tesseract.createWorker('eng');
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Processing [${i+1}/${files.length}]: ${file}`);
        const fullPath = path.join(dirPath, file);
        
        try {
            const { data: { text } } = await worker.recognize(fullPath);
            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
            
            lines.forEach(line => {
                allNarrations.push({
                    "Source Image": file,
                    "Extracted Text (Narration)": line
                });
            });
        } catch (e) {
            console.error(`Error processing ${file}:`, e);
        }
    }
    
    await worker.terminate();
    
    console.log(`Extraction complete. Found ${allNarrations.length} lines. Generating Excel...`);
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(allNarrations);
    
    // Auto-fit columns roughly
    ws['!cols'] = [
        { wch: 30 },
        { wch: 100 }
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, "Extracted_Narrations");
    XLSX.writeFile(wb, outputExcel);
    console.log(`Successfully saved to ${outputExcel}`);
}

main().catch(console.error);
