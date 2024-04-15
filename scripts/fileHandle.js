let formData = new FormData();
const toast_message = {
  Toast: Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  }),

  error: function (message) {
    this.Toast.fire({
      icon: "error",
      title: message
    });
  },

  success: function (message) {
    this.Toast.fire({
      icon: "success",
      title: message
    });
  }

}

function icon(type) {
  switch (type) {
    case "txt":
      return "https://cdn-icons-png.flaticon.com/512/4248/4248224.png";
    case "png":
      return "https://cdn-icons-png.flaticon.com/512/8243/8243033.png";
    case "svg":
    case "svg+xml":
      return "https://cdn-icons-png.flaticon.com/512/5063/5063253.png";
    case "jpeg":
      return "https://cdn-icons-png.flaticon.com/512/7858/7858983.png";
    case "obj":
      return "https://cdn-icons-png.flaticon.com/512/29/29536.png";
    case "gif":
      return "https://cdn-icons-png.flaticon.com/512/2306/2306094.png";
    case "webp":
      return "https://cdn-icons-png.flaticon.com/512/8263/8263118.png";
    case "bmp":
      return "https://cdn-icons-png.flaticon.com/512/8085/8085527.png";
    case "ico":
      return "https://cdn-icons-png.flaticon.com/512/1126/1126873.png";
    case "tif":
      return "https://cdn-icons-png.flaticon.com/512/8176/8176632.png";
    case "sql":
      return "https://cdn-icons-png.flaticon.com/512/4299/4299956.png";
    case "js":
    case "x-javascript":
      return "https://cdn-icons-png.flaticon.com/512/8945/8945622.png";
    case "json":
      return "https://cdn-icons-png.flaticon.com/512/136/136525.png";
    case "ts":
      return "https://cdn-icons-png.flaticon.com/512/8300/8300631.png";
    case "md":
      return "https://cdn-icons-png.flaticon.com/512/617/617467.png";
    case "cc":
      return "https://cdn-icons-png.flaticon.com/512/9095/9095099.png";
    case "cs":
      return "https://cdn-icons-png.flaticon.com/512/2306/2306037.png";
    case "c":
      return "https://cdn-icons-png.flaticon.com/512/3585/3585350.png";
    case "csv":
      return "https://cdn-icons-png.flaticon.com/512/9159/9159105.png";
    case "t":
      return "https://cdn-icons-png.flaticon.com/512/4490/4490695.png";
    case "r":
      return "https://cdn-icons-png.flaticon.com/512/8112/8112727.png";
    case "d":
      return "https://cdn-icons-png.flaticon.com/512/8112/8112877.png";
    case "h":
      return "https://cdn-icons-png.flaticon.com/512/8112/8112548.png";
    case "cs":
      return "https://cdn-icons-png.flaticon.com/512/7496/7496950.png";
    case "css":
      return "https://cdn-icons-png.flaticon.com/128/136/136527.png";
    case "html":
      return "https://cdn-icons-png.flaticon.com/512/136/136528.png";
    case "htm":
      return "https://cdn-icons-png.flaticon.com/512/136/136528.png";
    case "stylus":
      return "https://cdn-icons-png.flaticon.com/512/3650/3650875.png";
    case "sass":
      return "https://cdn-icons-png.flaticon.com/512/919/919831.png";
    case "php":
      return "https://cdn-icons-png.flaticon.com/512/2306/2306154.png";
    case "py":
      return "https://cdn-icons-png.flaticon.com/512/3098/3098090.png";
    case "node":
      return "https://cdn-icons-png.flaticon.com/512/5968/5968322.png";
    case "mp3":
      return "https://cdn-icons-png.flaticon.com/512/2306/2306139.png";
    case "mp4":
      return "https://cdn-icons-png.flaticon.com/512/1719/1719843.png";
    case "wav":
      return "https://cdn-icons-png.flaticon.com/512/8263/8263140.png";
    case "acc":
      return "https://cdn-icons-png.flaticon.com/512/8300/8300275.png";
    case "flac":
      return "https://cdn-icons-png.flaticon.com/512/730/730567.png";
    case "mp2":
      return "https://cdn-icons-png.flaticon.com/512/8300/8300531.png";
    case "mp1":
      return "https://cdn-icons-png.flaticon.com/512/8300/8300500.png";
    case "doc":
      return "https://cdn-icons-png.flaticon.com/512/4725/4725970.png";
    case "pdf":
    case "octet-stream":
      return "https://cdn-icons-png.flaticon.com/512/136/136522.png";
    case "jpg":
      return "https://cdn-icons-png.flaticon.com/512/337/337940.png";
    case "xls":
      return "https://cdn-icons-png.flaticon.com/512/3997/3997638.png";
    default:
      return "https://cdn-icons-png.flaticon.com/512/660/660726.png";
  }
}

function dropHandler(ev) {
  console.log("File(s) dropped");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  let files = ev.dataTransfer

  document.querySelector("#prevew").innerHTML = ""
  let data = [];
  if (files.items) {
    let arr = [...files.items].map(item => {
      if (item.kind === "file") {
        return item.getAsFile();
      } else {
        return false;
      }
    }).filter(x => x)
    handleFiles(arr)

  } else {
    // Use DataTransfer interface to access the file(s)
    handleFiles([...files.files]);


  }



}


function dragOverHandler(ev) {
  //console.log("File(s) in drop zone");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

function chooseFile(ev) {
  console.log("choosing files");
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  const inputFile = document.createElement('input');
  inputFile.type = 'file';
  inputFile.hidden = true;
  inputFile.multiple = true;
  //document.body.appendChild(inputFile);
  inputFile.click();

  inputFile.addEventListener('change', noDragFile);


}



function noDragFile(ev) {
  const files = ev.target.files;


  // Do something with the selected files
  handleFiles([...files])

}

function handleFiles(files) {
  let data = []
  files.forEach((file, i) => {
    let { name, size, type } = file
    data.push({ name, size, type: icon(type.split('/')[1]) })
    formData.append('file', file);
  });
  document.querySelector("#prevew").innerHTML = "<input type=\"submit\" value=\"Upload File\" onclick=\"submitData(event)\">";
  let table = createDOMtable(data);
  document.querySelector("#prevew").append(table)

  return formData;
}

var submitData = async function (ev) {
  ev.preventDefault();
  ev.stopPropagation();


  fetch('/fileupload', {
    method: 'POST',
    body: formData
  }).then(data => data.json() )
    .then(data => {
      if(data.ok){
        toast_message.success('Files were uploaded successfully');
        reload(); // Reload the page or perform other actions
      } else {
        toast_message.error(data.message);
      }
      
    })
    .catch(error => {
      console.error(error);
      toast_message.error("Failed "+error.message);
    });

  document.querySelector("#prevew").innerHTML = ""
  formData = new FormData();
}