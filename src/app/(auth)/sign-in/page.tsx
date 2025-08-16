import SignInForm from "@/auth/nextjs/components/SignInForm";


export default async function SignIn() {
  return (
    <div className="bg-muted flex min-h-screen flex-col items-center justify-center gap-6 p-6 md:p-10 w-full">
      <SignInForm />
    </div>
  );
}
