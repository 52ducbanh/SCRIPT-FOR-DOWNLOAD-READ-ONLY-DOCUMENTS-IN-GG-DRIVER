(function () {
  console.log("Loading script ...");

  let script = document.createElement("script");
  script.onload = function () {
    const { jsPDF } = window.jspdf;

    let pdf = null;
    let imgElements = document.getElementsByTagName("img");
    let validImgs = [];

    console.log("Scanning content ...");
    for (let i = 0; i < imgElements.length; i++) {
      let img = imgElements[i];
      let checkURLString = "blob:https://drive.google.com/";
      if (img.src.substring(0, checkURLString.length) !== checkURLString) {
        continue;
      }
      validImgs.push(img);
    }

    console.log(`${validImgs.length} content found!`);
    console.log("Generating PDF file ...");

    const DPR = window.devicePixelRatio || 1;
    const QUALITY_SCALE = 2;
    const TOTAL_SCALE = DPR * QUALITY_SCALE;

    for (let i = 0; i < validImgs.length; i++) {
      let img = validImgs[i];

      let canvasElement = document.createElement("canvas");
      let con = canvasElement.getContext("2d");

      canvasElement.width = img.naturalWidth * TOTAL_SCALE;
      canvasElement.height = img.naturalHeight * TOTAL_SCALE;

      con.scale(TOTAL_SCALE, TOTAL_SCALE);
      con.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);


      let imgData = canvasElement.toDataURL("image/jpeg", 0.95);

      let orientation = img.naturalWidth > img.naturalHeight ? "l" : "p";
      let pageWidth = img.naturalWidth;
      let pageHeight = img.naturalHeight;

      if (i === 0) {
        pdf = new jsPDF({
          orientation: orientation,
          unit: "px",
          format: [pageWidth, pageHeight],
          hotfixes: ["px_scaling"],
        });
      } else {
        pdf.addPage([pageWidth, pageHeight], orientation);
      }

      pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight, "", "FAST");

      const percentages = Math.floor(((i + 1) / validImgs.length) * 100);
      console.log(`Processing content ${percentages}%`);
    }

    let title = document.querySelector('meta[itemprop="name"]')?.content || document.title || 'download.pdf';
    if ((title.split(".").pop() || "").toLowerCase() !== "pdf") {
      title = title + ".pdf";
    }

    console.log("Downloading PDF file ...");
    pdf.save(title, { returnPromise: true }).then(() => {
      document.body.removeChild(script);
      console.log("PDF downloaded!");
    });
  };

  let scriptURL = "https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js";
  let trustedURL;
  if (window.trustedTypes && trustedTypes.createPolicy) {
    const policy = trustedTypes.createPolicy("myPolicy", {
      createScriptURL: (input) => input,
    });
    trustedURL = policy.createScriptURL(scriptURL);
  } else {
    trustedURL = scriptURL;
  }

  script.src = trustedURL;
  document.body.appendChild(script);
})();