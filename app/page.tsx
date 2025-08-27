import Header from "@/components/home/Header";
import Content from "@/components/home/Content";
import { FilterProvider } from "@/components/home/content/Filter";
import { SelectedProvider } from "@/components/home/content/Selected";

export default async function Home() {
  return (
    <FilterProvider>
      <SelectedProvider>
        <div className=" w-full">
          <Header />
          <Content />
        </div>
      </SelectedProvider>
    </FilterProvider>
  );
}
