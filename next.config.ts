import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  outputFileTracingRoot: path.join(__dirname),
  // The two Move The Chain case studies were merged into one.
  async redirects() {
    return ["mtc-fe", "mtc-ux"].map((id) => ({
      source: `/works/${id}`,
      destination: "/works/move-the-chain",
      permanent: true,
    }));
  },
};

export default nextConfig;
