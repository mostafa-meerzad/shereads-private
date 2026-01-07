const nextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental:{
    serverActions:{bodySizeLimit: "200mb"}
  }
};

export default nextConfig;
