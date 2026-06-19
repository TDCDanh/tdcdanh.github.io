document.addEventListener("DOMContentLoaded", () => {
  // ================= LOGIC CANVAS CHUỖI ẢNH (INTRO) =================
  const canvas = document.getElementById("hero-canvas");
  const context = canvas.getContext("2d");

  // Đã đảm bảo lấy 100 frames như bạn yêu cầu
  const frameCount = 72;

  // ĐÃ FIX LỖI Ở DÒNG NÀY:
  // Cập nhật lại đường dẫn với tiền tố "frame_" và đuôi ".jpg"
  // để khớp chính xác với thư mục máy tính của bạn
  const currentFrame = (index) =>
    `images/frame_${index.toString().padStart(3, "0")}.jpg`;

  const images = [];
  for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    images.push(img);
  }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    renderCanvas();
  }

  function renderCanvas() {
    const scrollTop = window.scrollY;
    const bufferHeight = document.querySelector(".scroll-buffer").offsetHeight;

    // TOÁN HỌC QUAN TRỌNG NHẤT NẰM Ở ĐÂY:
    // Trừ đi window.innerHeight để đảm bảo hàm cuộn từ frame 0 -> 100 kết thúc
    // CHÍNH XÁC tại khoảnh khắc portfolio bắt đầu chạm vào mép dưới màn hình.
    const maxScrollTop = bufferHeight - window.innerHeight;

    let scrollFraction = scrollTop / maxScrollTop;

    if (scrollFraction > 1) scrollFraction = 1;
    if (scrollFraction < 0) scrollFraction = 0;

    const frameIndex = Math.min(
      frameCount - 1,
      Math.floor(scrollFraction * frameCount),
    );

    const activeImage = images[frameIndex];
    if (activeImage && activeImage.complete) {
      context.clearRect(0, 0, canvas.width, canvas.height);

      const imgRatio = activeImage.width / activeImage.height;
      const canvasRatio = canvas.width / canvas.height;
      let renderWidth, renderHeight, xOffset, yOffset;

      if (canvasRatio > imgRatio) {
        renderWidth = canvas.width;
        renderHeight = canvas.width / imgRatio;
        xOffset = 0;
        yOffset = (canvas.height - renderHeight) / 2;
      } else {
        renderWidth = canvas.height * imgRatio;
        renderHeight = canvas.height;
        xOffset = (canvas.width - renderWidth) / 2;
        yOffset = 0;
      }

      context.drawImage(
        activeImage,
        xOffset,
        yOffset,
        renderWidth,
        renderHeight,
      );
    }
  }

  images[0].onload = () => {
    resizeCanvas();
  };

  window.addEventListener(
    "scroll",
    () => {
      requestAnimationFrame(renderCanvas);
    },
    { passive: true },
  );

  window.addEventListener("resize", resizeCanvas);
  // =================================================================

  // --- LOGIC CON TRỎ CHUỘT TÙY CHỈNH ---
  const cursorDot = document.getElementById("cursor-dot");
  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  if (isTouchDevice) {
    cursorDot.style.display = "none";
  } else {
    window.addEventListener("mousemove", (e) => {
      cursorDot.style.left = `${e.clientX}px`;
      cursorDot.style.top = `${e.clientY}px`;
    });

    const updateHoverListeners = () => {
      const interactiveElements = document.querySelectorAll(
        "a, button, .tilt-card, [role='button']",
      );
      interactiveElements.forEach((el) => {
        el.addEventListener("mouseenter", () => {
          cursorDot.classList.add("hovered");
        });
        el.addEventListener("mouseleave", () => {
          cursorDot.classList.remove("hovered");
        });
      });
    };

    updateHoverListeners();

    window.addEventListener("mousedown", () => {
      cursorDot.classList.add("clicked");
    });
    window.addEventListener("mouseup", () => {
      cursorDot.classList.remove("clicked");
    });
  }

  // --- LOGIC SAO CHÉP LIÊN KẾT & TOAST ---
  const copyBtn = document.getElementById("btn-copy-link");
  const toast = document.getElementById("toast-notification");

  if (copyBtn && toast) {
    copyBtn.addEventListener("click", () => {
      const urlToCopy = window.location.href;
      const tempTextArea = document.createElement("textarea");
      tempTextArea.value = urlToCopy;
      tempTextArea.style.position = "absolute";
      tempTextArea.style.left = "-9999px";
      document.body.appendChild(tempTextArea);
      tempTextArea.select();

      try {
        document.execCommand("copy");
        toast.classList.remove("translate-y-20", "opacity-0");
        toast.classList.add("translate-y-0", "opacity-100");

        setTimeout(() => {
          toast.classList.remove("translate-y-0", "opacity-100");
          toast.classList.add("translate-y-20", "opacity-0");
        }, 2500);
      } catch (err) {
        console.error("Failed to copy link: ", err);
      } finally {
        document.body.removeChild(tempTextArea);
      }
    });
  }

  // --- LOGIC BUBBLES TRÔI NỔI NỀN (Tự động thích ứng vùng Portfolio) ---
  const container = document.getElementById("blob-container");
  const colors = ["#00f2fe", "#318CE7", "#6b21a8", "#0f172a"];
  const numBlobs = 8;
  const blobs = [];

  // Đọc chiều cao chuẩn từ vùng portfolio thực tế
  const getWrapperBounds = () => {
    const wrapper = document.querySelector(".portfolio-wrapper");
    return {
      width: window.innerWidth,
      height: wrapper ? wrapper.offsetHeight : window.innerHeight,
    };
  };

  let bounds = getWrapperBounds();

  for (let i = 0; i < numBlobs; i++) {
    const blob = document.createElement("div");
    blob.classList.add("blob");
    const size = Math.random() * 350 + 250;
    blob.style.width = `${size}px`;
    blob.style.height = `${size}px`;
    blob.style.setProperty(
      "--c",
      colors[Math.floor(Math.random() * colors.length)],
    );
    container.appendChild(blob);

    blobs.push({
      element: blob,
      x: Math.random() * bounds.width,
      y: Math.random() * bounds.height,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      size: size,
    });
  }

  function animateBlobs() {
    blobs.forEach((b) => {
      b.x += b.vx;
      b.y += b.vy;
      if (b.x <= -b.size / 2 || b.x >= bounds.width - b.size / 2) b.vx *= -1;
      if (b.y <= -b.size / 2 || b.y >= bounds.height - b.size / 2) b.vy *= -1;
      b.element.style.transform = `translate(${b.x}px, ${b.y}px)`;
    });
    requestAnimationFrame(animateBlobs);
  }
  animateBlobs();

  // --- HIỆU ỨNG TILT 3D CARD ---
  const tiltCards = document.querySelectorAll(".tilt-card");
  tiltCards.forEach((card) => {
    const glare = card.querySelector(".glare");
    card.addEventListener("mousemove", (e) => {
      if (window.innerWidth < 768) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      if (glare) {
        glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.2) 0%, transparent 50%)`;
      }
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      if (glare) {
        glare.style.background = `radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 0%, transparent 50%)`;
      }
    });
  });

  window.addEventListener("resize", () => {
    bounds = getWrapperBounds();
    blobs.forEach((b) => {
      if (b.x > bounds.width) b.x = bounds.width - b.size;
      if (b.y > bounds.height) b.y = bounds.height - b.size;
    });
  });
});
