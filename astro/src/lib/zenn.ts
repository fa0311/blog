import type { MarkdownInstance } from "astro";
import "zenn-content-css";
import { type Article } from "zenn-model";
import markdownToHtml from "./markdownToHtml";

import * as cheerio from "cheerio";
import "zenn-content-css";

export const getArticleList = () => {
  const slugs = import.meta.glob<MarkdownInstance<Article>>("../../../articles/*.md");
  return Promise.all(Object.values(slugs).map((article) => article()));
};

export const markdownToHtmlNormalized = (raw: string) => {
  const html = markdownToHtml(raw, {
    embedOrigin: "https://embed.zenn.studio",
  });

  const $ = cheerio.load(html);

  $(`img`).each((i, el) => {
    const src = $(el).attr("src")!.slice("images/".length);
    $(el).attr("src", src);
  });

  Array.from([1, 2, 3, 4, 5]).forEach((i) => {
    $(`h${i}`).each((i, el) => {
      const id = $(el).text().toLowerCase().replace(/\s/g, "-");
      $(el).attr("id", id);
    });
  });
  return {
    contents: () => $("body").html()!,
    description: () => $("p").first().text(),
  };
};
