function showPreview(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById('image-preview');
            const icon = document.getElementById("file-img");
            const img = document.getElementById("ticket-img");
            // Update image preview
            preview.src = e.target.result;
            // img.src = e.target.result;
            preview.style.display = 'block';

            // Hide the "+" icon and text
            icon.style.display = 'none';
            
        };
        reader.readAsDataURL(file);
    }
}
// function check() {
//     const preview = document.getElementById('image-preview');
//     if (preview.src == false) {
//         const ere = document.getElementById("img-er");
//         ere.style.display = 'block';
//     }
// }
function checkForm() {
    const fileInput = document.getElementById('file');
    const imgError = document.getElementById('img-er');
  
    // Check if an image has been uploaded
    if (!fileInput.files || fileInput.files.length === 0) {
      imgError.style.color = "red";
      imgError.style.display = "block";
      return false; // Prevent form submission
    }
  
    imgError.style.display = "none"; // Hide error message if image is selected
    return true; // Allow form submission
  }
  