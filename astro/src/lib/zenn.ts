import type { MarkdownInstance } from "astro";
import "zenn-content-css";
import { type Article } from "zenn-model";
import markdownToHtml from "./markdownToHtml";

import * as cheerio from "cheerio";
import "zenn-content-css";

export type ZennArticle = MarkdownInstance<Article>;
export const getArticleList = () => {
  const slugs = import.meta.glob<ZennArticle>("../../../articles/*.md");
  return Promise.all(Object.values(slugs).map((article) => article()));
};

export const getRelatedArticles = (articles: ZennArticle[], current: ZennArticle) => {
  const relatedArticles = articles
    .filter((article) => article.file !== current.file)
    .map((article) => {
      const tagA = article.frontmatter.tags ?? [];
      const tagB = current.frontmatter.tags ?? [];
      const similarity = calculateSimilarity(tagA, tagB);
      return { ...article, similarity, random: Math.random() };
    })
    .sort((a, b) => {
      if (a.similarity !== b.similarity) {
        return b.similarity - a.similarity;
      } else {
        return b.random - a.random;
      }
    });
  return relatedArticles;
};

const calculateSimilarity = (a: string[], b: string[]) => {
  const intersection = a.filter((value) => b.includes(value));
  const union = [...new Set([...a, ...b])];
  return intersection.length / union.length;
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

  // Array.from([5, 4, 3, 2, 1]).forEach((i) => {
  //   $(`h${i}`).each((_, el) => {
  //     console.log($(`h${i}`).html());
  //     $(el).replaceWith(`<h${i + 1}>${$(el).html()}</h${i + 1}>`);
  //   });
  // });
  return {
    contents: () => $("body").html()!,
    description: () => $("p").first().text(),
  };
};
