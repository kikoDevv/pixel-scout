import Link from "next/link";

export default function SignUp() {
  return (
    <div className="h-[calc(100vh-80px)] flex items-center justify-center">
      <section className="border-2 rounded-xl p-8">
        <h1 className="text-center mb-10 text-2xl font-bold">Logga in</h1>
        <form className="grid gap-2">
          <input type="text" placeholder="Ditt email" className="bg-gray-200 p-2 rounded-md" />
          <input type="password" className="bg-gray-200 p-2 rounded-md" placeholder="Välja lösenord" />

          <button className="px-4 py-1 rounded-md cursor-pointer hover:bg-neutral-500 bg-neutral-600 text-white w-fit justify-self-center mt-10">
            Logga in
          </button>
          <Link href={"/sign-up"} className="font-semibold underline text-blue-600 cursor-pointer">
            Registrera ditt kono
          </Link>
        </form>
      </section>
    </div>
  );
}
