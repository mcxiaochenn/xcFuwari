if (window.innerWidth > 768) {
	const bgImage = new Image();
	bgImage.src = "/img/xiowo-bg-dark.webp";

	bgImage.onload = () => {
		document.body.style.setProperty("--bg-url", `url('${bgImage.src}')`);
		document.body.classList.add("bg-loaded");
	};
}
