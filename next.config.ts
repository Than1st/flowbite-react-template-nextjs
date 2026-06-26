import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["date-fns", "flowbite-react", "react-icons"],
  },
};

export default withFlowbiteReact(nextConfig);
