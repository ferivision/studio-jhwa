import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { getDictionary } from "@/lib/content";

// not-found receives no params; show both languages.
export default function NotFound() {
  const en = getDictionary("en");
  const id = getDictionary("id");
  return (
    <main id="main" className="py-section">
      <Container className="flex flex-col gap-6">
        <Heading as="h1" size="display-lg" variant="thin">
          {en.notFound.title}
        </Heading>
        <p className="text-body-lg text-muted">{en.notFound.body}</p>
        <p lang="id" className="text-body-lg text-muted">
          {id.notFound.body}
        </p>
        <div className="flex gap-6">
          <Link href="/en" className="underline underline-offset-6">
            {en.notFound.home}
          </Link>
          <Link href="/id" lang="id" className="underline underline-offset-6">
            {id.notFound.home}
          </Link>
        </div>
      </Container>
    </main>
  );
}
