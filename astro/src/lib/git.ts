import { simpleGit } from "simple-git";

const git = simpleGit("./");

// CI (Cloudflare Pages) clones shallowly, which makes every file look like it was committed at HEAD.
let unshallow: Promise<void> | undefined;
const ensureFullHistory = () => {
  unshallow ??= (async () => {
    const shallow = await git.revparse(["--is-shallow-repository"]);
    if (shallow.trim() === "true") {
      await git.fetch(["--unshallow"]);
    }
  })();
  return unshallow;
};

export const getLatestCommitTime = async (path: string): Promise<Date | undefined> => {
  await ensureFullHistory();
  return new Promise((resolve, reject) => {
    git.log(["-1", path], (err, log) => {
      if (err) {
        reject(err);
      } else if (log.latest) {
        resolve(new Date(log.latest.date));
      } else {
        resolve(undefined);
      }
    });
  });
};

export const getFirstCommitTime = async (path: string): Promise<Date | undefined> => {
  await ensureFullHistory();
  return new Promise((resolve, reject) => {
    git.log(["--diff-filter=A", path], (err, log) => {
      if (err) {
        reject(err);
      } else if (log.latest) {
        resolve(new Date(log.latest.date));
      } else {
        resolve(undefined);
      }
    });
  });
};

const stripCredentials = (url: string) => {
  const u = new URL(url);
  u.username = "";
  u.password = "";
  return u.href;
};

export const getRemoteUrl = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    git.listRemote(["--get-url"], (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(stripCredentials(data.trim()));
      }
    });
  });
};
