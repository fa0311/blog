import { useEffect } from "react";
import "zenn-content-css";

type ZennProps = {
  html: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const Zenn: React.FC<ZennProps> = ({ html, ...props }) => {
  useEffect(() => {
    import("zenn-embed-elements");
  }, []);

  return (
    <div
      className="znc"
      {...props}
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    />
  );
};
