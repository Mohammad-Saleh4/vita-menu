import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicMenuBySlug } from "@/actions/menu";
import { MenuClient } from "./menu-client";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicMenuBySlug(slug);

  if (!result.success) {
    return { title: "Menu not found" };
  }

  return {
    title: `${result.data.name} | Menu`,
    description:
      result.data.description ?? `View the menu for ${result.data.name}`,
  };
}

export default async function PublicMenuPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getPublicMenuBySlug(slug);

  if (!result.success) {
    notFound();
  }

  return <MenuClient restaurant={result.data} />;
}
