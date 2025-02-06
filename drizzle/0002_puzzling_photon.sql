ALTER TABLE "transaction" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;