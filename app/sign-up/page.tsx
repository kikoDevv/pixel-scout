import Link from "next/link";

export default function SignIn() {
  return (
    <div className="h-[calc(100vh-80px)] flex items-center justify-center">
      <section className="border-2 rounded-xl p-8">
        <h1 className="text-center mb-10 text-2xl font-bold">Skapa konto</h1>
        <form className="grid gap-2">
          <input type="text" placeholder="Ditt använder namn" className="bg-gray-200 p-2 rounded-md" />
          <input type="email" className="bg-gray-200 p-2 rounded-md" placeholder="Ditt email" />
          <input type="password" className="bg-gray-200 p-2 rounded-md" placeholder="Välja lösenord" />
          <input type="password" className="bg-gray-200 p-2 rounded-md" placeholder="Bekräfta lösenordet" />
          <button className="px-4 py-1 rounded-md cursor-pointer hover:bg-neutral-500 bg-neutral-600 text-white w-fit justify-self-center mt-10">
            Registrera
          </button>
          <Link href={"/sign-in"} className="font-semibold underline text-blue-600 cursor-pointer">
            Har du redan ett konto
          </Link>
        </form>
      </section>
    </div>
  );
}
