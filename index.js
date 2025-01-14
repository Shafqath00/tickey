import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { createCanvas, loadImage } from "canvas";
import fs from "fs";

const app = express();
const port = 3000;

let name,email,github;
let uploadedImagePath ;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rendom_num = Math.floor(1000 + Math.random()*9000);
// Multer Configuration
const storage = multer.diskStorage({
  destination:"uploads/",
  filename:(req,file,cd)=>{
      cd(null,`${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
  res.render("index");
});
;
app.post("/generate", upload.single("file"), async (req, res) => {
  name = req.body.name;
  email = req.body.mail;
  github = req.body.github;
   uploadedImagePath =req.file? `uploads/${req.file.filename}`:null;
  const patternPath = path.join(__dirname, "public", "pattern-ticket.svg");
  console.log(uploadedImagePath);
  await res.render("ticket.ejs",{
    name:name,
    email:email,
    github:github,
    img:uploadedImagePath,
    num:rendom_num
  });
  
  
});
app.post("/download",upload.single("file"),async(req,res)=>{
  // const { name, email, github } = req.body;
  //  uploadedImagePath = req.file ? req.file.path : null;
  const patternPath = path.join(__dirname, "public", "pattern-ticket.svg");
  try {
    const ticketPath = await generateTicket(name, email, github, uploadedImagePath, patternPath);

    // Send the generated ticket for download
    res.download(ticketPath, "ticket.png", (err) => {
      if (err) console.error(err);
      fs.unlinkSync(ticketPath); // Cleanup generated ticket
      if (uploadedImagePath) fs.unlinkSync(uploadedImagePath); // Cleanup uploaded image
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to generate ticket.");
  }
  
})
// Function to Generate Ticket
async function generateTicket(name, email, github, uploadedImagePath, patternPath) {
  const width = 400;
  const height = 200;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Load the background pattern
  const pattern = await loadImage(patternPath);
  ctx.drawImage(pattern, 0, 0, width, height);

  // Add Text
  ctx.fillStyle = "#ffffff";
  ctx.font = "25px Arial";
  // const logo = loadImage("assets/logo-full.png");
  // ctx.drawImage(logo,50,50,100,100);
  ctx.fillText("Coding Conf", 10, 30);
  ctx.fillText("Jan 31, 2025 / Austin, TX",10,70);
  ctx.font = "18px Arial";
  ctx.fillText(name, 70, 160);
  // ctx.fillText(`Email: ${email}`, 50, 150);
  ctx.fillText(github, 70, 185);
  

  // Add uploaded image (if available)
  if (uploadedImagePath) {
    console.log("Avatar Path:", uploadedImagePath);
    const userImage = await loadImage(uploadedImagePath);
    ctx.drawImage(userImage, 10, 140, 50, 50); // Draw the image on the ticket
  }

  // Save to File
  const ticketPath = `ticket_${Date.now()}.png`;
  const out = fs.createWriteStream(ticketPath);
  const stream = canvas.createPNGStream();
  stream.pipe(out);

  return new Promise((resolve, reject) => {
    out.on("finish", () => resolve(ticketPath));
    out.on("error", reject);
  });
}
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Start Server
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
