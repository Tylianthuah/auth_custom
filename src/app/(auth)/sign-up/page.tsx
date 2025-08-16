import SignUpForm from "@/auth/nextjs/components/SignUpForm";


export default function SignUp() {
  return (
    <div className="bg-muted flex min-h-screen flex-col items-center justify-center gap-6 p-6 md:p-10 w-full">
        <SignUpForm />
    </div>
  );
}
