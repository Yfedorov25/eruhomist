#!/usr/bin/env node
/*
  download-assets.mjs
  Скачує зображення об'єктів з Instagram CDN у public/objects/.
  Запуск:  node download-assets.mjs
  (виконувати з кореня Next.js проєкту)

  УВАГА: URL Instagram CDN мають термін дії (oe= параметр).
  Якщо якесь посилання віддає 403/410 — воно протермінувалось.
  Тоді відкрий відповідний пост (url нижче) і збережи фото вручну.
*/

import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const OUT = "public/objects";

const ASSETS = [
  {
    name: "soborna-22",
    post: "https://www.instagram.com/p/DY6glS8si-9/",
    url: "https://scontent-ord5-2.cdninstagram.com/v/t51.82787-15/709921456_18030038081815361_5831792872789386431_n.jpg?stp=dst-jpg_e35_p1080x1080_sh2.08_tt6&_nc_ht=scontent-ord5-2.cdninstagram.com&_nc_cat=105&_nc_oc=Q6cZ2gFmP8ulQLl6FUkEWaVrlADP5oXOihgHXtrjvtedbie_Af3Os1AqNKK7sDdZThQ4bwY&_nc_ohc=ie_AHR8HeAsQ7kNvwE3BuMi&_nc_gid=QUbFVJsV50bDdjLFH_aspw&edm=APs17CUBAAAA&ccb=7-5&oh=00_Af-T3pha31hfzeh3oJjXuNqsgJz5_NsTPev8AJOBV2KzvA&oe=6A226D0B&_nc_sid=10d13b",
  },
  {
    name: "development",
    post: "https://www.instagram.com/p/DYjuuNFjCmb/",
    url: "https://scontent-ord5-2.cdninstagram.com/v/t51.82787-15/703745774_18028833011815361_436859764601117494_n.jpg?stp=dst-jpg_e35_p1080x1080_sh2.08_tt6&_nc_ht=scontent-ord5-2.cdninstagram.com&_nc_cat=105&_nc_oc=Q6cZ2gGD_5Ba07a3D1bHlIcmOYuuluz9DcXWlJKGMo2GEy5zMSbLPwfvRqq9V38HWili1rU&_nc_ohc=_VpbPbOdgd0Q7kNvwHxigoV&_nc_gid=1P-qI8tvEHAkIpIpQQYWDQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_Af_Fp4PtWqeIOrNF3bdC-9tTlGe-P3KA6_-i4bnNU2RvPA&oe=6A22726B&_nc_sid=10d13b",
  },
  {
    name: "townhouse",
    post: "https://www.instagram.com/p/DX7VN_TMkpM/",
    url: "https://scontent-iad3-2.cdninstagram.com/v/t51.82787-15/688299140_18027123683815361_5612139281717052687_n.jpg?stp=dst-jpg_e35_p1080x1080_sh2.08_tt6&_nc_ht=scontent-iad3-2.cdninstagram.com&_nc_cat=105&_nc_oc=Q6cZ2gF0lAguWP4QXGAfQHBT7vg-RWJF3ayigDbt7QT8PyXuohNAAQsR1nkGsZ8xXw1N2MI&_nc_ohc=42QFwVpaWFYQ7kNvwEaU_eS&_nc_gid=1EaIvVXfOCsKdc0OjrkuEw&edm=APs17CUBAAAA&ccb=7-5&oh=00_Af8DZo_qvOTYXTc47t2TQIi_8kw4YY5WpejyhS3vizaIJA&oe=6A2276E2&_nc_sid=10d13b",
  },
  {
    name: "cottage-shkurintsi",
    post: "https://www.instagram.com/p/DUVoOHVDPQG/",
    url: "https://instagram.fosu3-1.fna.fbcdn.net/v/t51.82787-15/629287778_18015641879815361_8374805384609392962_n.jpg?stp=dst-jpg_e15_fr_p1080x1080_tt6&_nc_ht=instagram.fosu3-1.fna.fbcdn.net&_nc_cat=105&_nc_oc=Q6cZ2gEDWrV9tv1BCfJfBeYNoxfxABez2mLiD6fOYByuCkejCXs9RJgnkwTxBlJ6_OnPhkI&_nc_ohc=B3h7fnreg0oQ7kNvwFADxGT&_nc_gid=c5omNZJipkvekfuTBKjVcg&edm=APs17CUBAAAA&ccb=7-5&oh=00_Af9auWVFa3g2oTYKBoEZKJ_OgMfkpi1wtoiH712CiciXsA&oe=6A2276BE&_nc_sid=10d13b",
  },
  {
    name: "commerce",
    post: "https://www.instagram.com/p/DUn42pojJ_c/",
    url: "https://scontent-phx1-1.cdninstagram.com/v/t51.82787-15/631833316_18016379894815361_2495148844581473792_n.jpg?stp=dst-jpg_e15_fr_p1080x1080_tt6&_nc_ht=scontent-phx1-1.cdninstagram.com&_nc_cat=105&_nc_oc=Q6cZ2gG3Y213VbQOz2RyY97jFUNIc7YO4M6mfo_vPehWWGSd-Rq0WrZlCiys1cBJYqVoMYQ&_nc_ohc=toTs4CDEn80Q7kNvwHQYA1V&_nc_gid=FWOGfAm0hZlkEc5tYKw1xg&edm=APs17CUBAAAA&ccb=7-5&oh=00_Af8v5kFBoDAyHKaEU_ycA-ahyLKN7V3yiBGWh9SyQrxFtA&oe=6A22554E&_nc_sid=10d13b",
  },
  {
    name: "friendly-jk",
    post: "https://www.instagram.com/p/DSXARghjCjB/",
    url: "https://scontent-den2-1.cdninstagram.com/v/t51.82787-15/602172895_18010322312815361_8347958564908294973_n.jpg?stp=dst-jpg_e15_fr_p1080x1080_tt6&_nc_ht=scontent-den2-1.cdninstagram.com&_nc_cat=105&_nc_oc=Q6cZ2gGQqrLZ4PSiN2aaejfzDiM7ZhDTCy1C4iCf6_x7aDZqLBKnTsyRAY6zk5V-T7xqTNU&_nc_ohc=HCAjbsbgyZ4Q7kNvwFgAq2K&_nc_gid=zvumSeuKhY9WjQOsykxEQQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_Af9BehOt6NRO_eY9FmpxmeAywMnxfuDWA2Ll9utF52_soA&oe=6A2265DA&_nc_sid=10d13b",
  },
  {
    name: "smart-old-town",
    post: "https://www.instagram.com/p/DSSkyFQjMeS/",
    url: "https://scontent-mia3-2.cdninstagram.com/v/t51.82787-15/601513110_18010155821815361_194335185785521817_n.jpg?stp=dst-jpg_e15_fr_p1080x1080_tt6&_nc_ht=scontent-mia3-2.cdninstagram.com&_nc_cat=105&_nc_oc=Q6cZ2gGEcFDdSnnPI_CbT-vqsHbslo5GJfKLLmHLCeYH0ELOl0wf9iFDW3VysEL8f1Gyk7g&_nc_ohc=EFLtn4FEGwkQ7kNvwGvb1NC&_nc_gid=n2xoye0kyrQbyPDdjzJMlg&edm=APs17CUBAAAA&ccb=7-5&oh=00_Af9N1aWI_aGwmRbDI-1IIaDJRkfvpqGQKNXmdHaAo7imwQ&oe=6A2247A2&_nc_sid=10d13b",
  },
  {
    name: "brand-team",
    post: "https://www.instagram.com/p/DE20HIuMRPw/",
    url: "https://scontent-lga3-2.cdninstagram.com/v/t51.2885-15/504855452_17990483333815361_767035259126056645_n.jpg?stp=dst-jpg_e35_p1080x1080_sh2.08_tt6&_nc_ht=scontent-lga3-2.cdninstagram.com&_nc_cat=105&_nc_oc=Q6cZ2gFlIGJC_cu4Yt_MtV14LppMBXhlwrQkqo2mp_6qcjzavN6eC8QQpE4f7DndpqqY9EQ&_nc_ohc=LAZ6k7HJukwQ7kNvwH2zJv5&_nc_gid=h-UVHUo6OctpMEZ6yYGoIA&edm=APs17CUBAAAA&ccb=7-5&oh=00_Af8-F-8R-jzdQEtQ0ph79pmLTLo_HdWjzVXtX86bNtnTRg&oe=6A22568B&_nc_sid=10d13b",
  },
];

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

async function run() {
  if (!existsSync(OUT)) await mkdir(OUT, { recursive: true });
  for (const a of ASSETS) {
    try {
      const res = await fetch(a.url, { headers: { "User-Agent": UA } });
      if (!res.ok) {
        console.log(`✗ ${a.name}: HTTP ${res.status} — посилання протермінувалось. Збережи вручну з ${a.post}`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      const file = `${OUT}/${a.name}.jpg`;
      await writeFile(file, buf);
      console.log(`✓ ${a.name}.jpg — ${(buf.length / 1024).toFixed(0)} KB`);
    } catch (e) {
      console.log(`✗ ${a.name}: ${e.message} — збережи вручну з ${a.post}`);
    }
  }
  console.log("\nГотово. Перевір public/objects/. Опційно сконверти в webp (sharp).");
}

run();
