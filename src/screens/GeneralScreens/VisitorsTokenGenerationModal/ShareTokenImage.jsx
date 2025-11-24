export const ShareTokenImage = ({ qrCanvasRef, token, visitorName }) => {
  // Generate a professional shareable image with QR code and token details
  const generateShareableImage = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mainCanvas = document.createElement("canvas");
        const mainCtx = mainCanvas.getContext("2d");

        // Set canvas size
        const width = 1000;
        const height = 1200;
        mainCanvas.width = width;
        mainCanvas.height = height;

        // Professional color palette
        const bgColor = "#f8f7ff"; // Subtle purple tint background
        const cardBg = "#ffffff"; // Clean white
        const textColor = "#1a1a2e"; // Deep dark for text
        const accentColor = "#6d28d9"; // Rich purple
        const lightText = "#666666"; // Medium gray

        // Background with subtle gradient effect
        mainCtx.fillStyle = bgColor;
        mainCtx.fillRect(0, 0, width, height);

        // Main content card with shadow effect
        mainCtx.fillStyle = cardBg;
        mainCtx.shadowColor = "rgba(0, 0, 0, 0.08)";
        mainCtx.shadowBlur = 15;
        mainCtx.shadowOffsetY = 8;
        mainCtx.fillRect(40, 40, width - 80, height - 80);
        mainCtx.shadowColor = "transparent";

        // Top accent bar - thinner, elegant
        mainCtx.fillStyle = accentColor;
        mainCtx.fillRect(40, 40, width - 80, 5);

        // Brand section - Springfield Estate
        mainCtx.fillStyle = accentColor;
        mainCtx.font = "bold 38px 'Arial', sans-serif";
        mainCtx.textAlign = "center";
        mainCtx.fillText("Springfield Estate", width / 2, 110);

        // Subtitle
        mainCtx.fillStyle = lightText;
        mainCtx.font = "14px Arial";
        mainCtx.fillText("Visitor Access Pass", width / 2, 135);

        // Elegant separator
        mainCtx.strokeStyle = accentColor;
        mainCtx.lineWidth = 1.5;
        mainCtx.globalAlpha = 0.3;
        mainCtx.beginPath();
        mainCtx.moveTo(150, 155);
        mainCtx.lineTo(width - 150, 155);
        mainCtx.stroke();
        mainCtx.globalAlpha = 1;

        // Large QR Code section
        const qrSize = 650;
        const qrX = (width - qrSize) / 2;
        const qrY = 190;

        // QR Code container with subtle background
        mainCtx.fillStyle = "#fafbff";
        mainCtx.fillRect(qrX - 25, qrY - 25, qrSize + 50, qrSize + 50);

        // QR Code elegant border
        mainCtx.strokeStyle = accentColor;
        mainCtx.lineWidth = 1.5;
        mainCtx.globalAlpha = 0.4;
        mainCtx.strokeRect(qrX - 25, qrY - 25, qrSize + 50, qrSize + 50);
        mainCtx.globalAlpha = 1;

        // Draw QR code from ref
        if (qrCanvasRef?.current) {
          try {
            const svgElement = qrCanvasRef.current.querySelector("svg");
            if (svgElement) {
              const svgCanvas = document.createElement("canvas");
              svgCanvas.width = qrSize;
              svgCanvas.height = qrSize;
              const svgCtx = svgCanvas.getContext("2d");

              const svgData = new XMLSerializer().serializeToString(svgElement);
              const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
              const svgUrl = URL.createObjectURL(svgBlob);

              const img = new Image();
              img.onload = () => {
                svgCtx.drawImage(img, 0, 0, qrSize, qrSize);
                mainCtx.drawImage(svgCanvas, qrX, qrY, qrSize, qrSize);
                URL.revokeObjectURL(svgUrl);

                // Draw remaining content after QR is ready
                drawTokenContent();
                resolve(mainCanvas);
              };
              img.src = svgUrl;
              return;
            }
          } catch (err) {
            console.error("Error drawing QR code:", err);
          }
        }

        drawTokenContent();
        resolve(mainCanvas);

        function drawTokenContent() {
          const tokenStartY = qrY + qrSize + 70;

          // Token label - elegant
          mainCtx.fillStyle = textColor;
          mainCtx.font = "bold 18px Arial";
          mainCtx.textAlign = "center";
          mainCtx.fillText("ACCESS TOKEN", width / 2, tokenStartY);

          // Token box - clean gradient
          const tokenGradient = mainCtx.createLinearGradient(
            0,
            tokenStartY + 20,
            0,
            tokenStartY + 70
          );
          tokenGradient.addColorStop(0, accentColor);
          tokenGradient.addColorStop(1, "#5b21b6");
          mainCtx.fillStyle = tokenGradient;
          mainCtx.fillRect(60, tokenStartY + 20, width - 120, 50);

          // Token text - clear and readable
          mainCtx.fillStyle = "#ffffff";
          mainCtx.font = "bold 22px 'Courier New', monospace";
          mainCtx.textAlign = "center";
          mainCtx.fillText(token, width / 2, tokenStartY + 53);

          // Footer message - professional
          mainCtx.fillStyle = textColor;
          mainCtx.font = "italic 16px Arial";
          mainCtx.textAlign = "center";
          mainCtx.fillText(
            "Present this token at the gate/entrance",
            width / 2,
            height - 90
          );

          // Security system text - subtle
          mainCtx.fillStyle = accentColor;
          mainCtx.globalAlpha = 0.6;
          mainCtx.font = "14px Arial";
          mainCtx.fillText(
            "Springfield Estate Security System",
            width / 2,
            height - 60
          );
          mainCtx.globalAlpha = 1;
        }
      }, 100);
    });
  };

  const downloadImage = async () => {
    try {
      const canvas = await generateShareableImage();
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `visitor-token-${token.slice(0, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading image:", err);
    }
  };

  const shareImage = async () => {
    try {
      const canvas = await generateShareableImage();

      // Check if Web Share API is available and supports files
      if (navigator.share && navigator.canShare) {
        const blob = await new Promise((resolve) => canvas.toBlob(resolve));
        const file = new File(
          [blob],
          `visitor-token-${token.slice(0, 8)}.png`,
          {
            type: "image/png",
          }
        );

        // Check if files can be shared
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Visitor Access Token",
            text: `Visitor token for ${visitorName}`,
            files: [file],
          });
        } else {
          // Fallback to sharing without files (text only)
          await navigator.share({
            title: "Visitor Access Token",
            text: `Visitor token for ${visitorName}. Token: ${token}`,
          });
        }
      } else if (navigator.share) {
        // Share API available but no canShare method (older browsers)
        await navigator.share({
          title: "Visitor Access Token",
          text: `Visitor token for ${visitorName}. Token: ${token}`,
        });
      } else {
        // No share API - download instead
        downloadImage();
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error sharing image:", err);
        // If sharing fails, fallback to download
        downloadImage();
      }
    }
  };

  return {
    downloadImage,
    shareImage,
  };
};
