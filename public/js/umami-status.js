const API_URL = "https://rainyun-apiumami.mcxiaochen.top/";

async function loadUmamiStats() {
	try {
		const res = await fetch(API_URL, { cache: "no-store" });
		const data = await res.json();

		function set(id, value) {
			const el = document.getElementById(id);
			if (el) el.textContent = value ?? 0;
		}

		set("stat-online", data.online_users);
		set("stat-uv", data.today_uv);
		set("stat-today-pv", data.today_pv);
		set("stat-yesterday-pv", data.yesterday_pv);
		set("stat-month-pv", data.last_month_pv ?? 0);
		set("stat-total-pv", data.total_pv);
	} catch (err) {
		console.error("Umami API Error:", err);
	}
}

/* 首次加载 */
document.addEventListener("DOMContentLoaded", loadUmamiStats);

/* Astro 页面切换后重新执行 */
document.addEventListener("astro:page-load", loadUmamiStats);
