"use client";
import React from "react";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="h-[50rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20">
      <div className="py-10 md:py-40 w-full relative px-10 sm:px-0">
        <Header titleComponent={titleComponent} />
        <Card>{children}</Card>
      </div>
    </div>
  );
};

export const Header = ({ titleComponent }: { titleComponent: string | React.ReactNode }) => {
  return <div className="max-w-5xl mx-auto text-center">{titleComponent}</div>;
};

export const Card = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full border-4 border-[#6C6C6C] p-2 md:p-6 bg-[#222222] rounded-[30px] shadow-2xl mt-5">
      <div className=" h-full w-full  overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-900 md:rounded-2xl md:p-1">
        {children}
      </div>
    </div>
  );
};
