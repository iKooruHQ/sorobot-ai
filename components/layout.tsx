interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="mx-auto flex flex-col space-y-4 bg-neutral-900">
      <div className="mx-auto flex flex-col gap-4 ">
        {/* <header className="mt-2 mx-auto">
          <div className="h-8 border-b border-b-slate-200 ">
            <nav className="ml-4 pl-6">
              <a
                href="#"
                className=" text-white hover:text-slate-600 cursor-pointer px-4"
              >
                Stellar Docs
              </a>
              <a
                href="#"
                className=" text-white hover:text-slate-600 cursor-pointer px-4"
              >
                Soroban Docs
              </a>

              <a
                href="#"
                className="text-white hover:text-slate-600 cursor-pointer px-4"
              >
                Rust Docs
              </a>
              <a
                href="#"
                className="text-white hover:text-slate-600 cursor-pointer px-4"
              >
                Github Repo
              </a>
            </nav>
          </div>
        </header> */}
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
      //{' '}
    </div>
  );
}
