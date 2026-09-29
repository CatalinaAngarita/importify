import { Global, Module } from "@nestjs/common";
import { getDb } from "./db";

export const DATABASE = "DATABASE";

@Global()
@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory: () => getDb(),
    },
  ],
  exports: [DATABASE],
})
export class DatabaseModule {}
