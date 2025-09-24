import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Add API prefix for all routes
  app.setGlobalPrefix("api");

  // Serve static files from frontend build (for production)
  if (process.env.NODE_ENV === "production") {
    app.useStaticAssets(join(__dirname, "..", "..", "frontend", "build"));
    app.setBaseViewsDir(join(__dirname, "..", "..", "frontend", "build"));

    // Serve React app for all non-API routes
    app.getHttpAdapter().get("*", (req: any, res: any) => {
      if (!req.url.startsWith("/api")) {
        res.sendFile(
          join(__dirname, "..", "..", "frontend", "build", "index.html")
        );
      }
    });
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Chat app backend is running on http://localhost:${port}`);
}
bootstrap();
