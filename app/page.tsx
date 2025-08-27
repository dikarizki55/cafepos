import Header from "@/components/home/Header";
import Content from "@/components/home/Content";
import { FilterProvider } from "@/components/home/content/Filter";
import { SelectedProvider } from "@/components/home/content/Selected";
import { Suspense } from "react";

export default async function Home() {
  return (
    <FilterProvider>
      <SelectedProvider>
        <div className=" w-full">
          <Suspense>
            <Header />
          </Suspense>
          <Content />
        </div>
      </SelectedProvider>
    </FilterProvider>
  );
}
