// Pull full readme for this page from GitHub
import invariant from "tiny-invariant";
import { getResource } from "~/lib/resources.server";
import { InitCodeblock, ResourceTag } from "~/ui/resources";
import { octokit } from "~/lib/github.server";
import "~/styles/docs.css";
import iconsHref from "~/icons.svg";
import { getMeta } from "~/lib/meta";
import type { Route } from "./+types/_extras.resources.$";

export async function loader({ request, params }: Route.LoaderArgs) {
  const resourceSlug = params["*"];
  invariant(resourceSlug, "resourceSlug is required");

  let resource = await getResource(resourceSlug, { octokit });

  if (!resource) {
    throw new Response(null, { status: 404 });
  }

  let requestUrl = new URL(request.url);
  let siteUrl = `${requestUrl.protocol}//${requestUrl.host}/resources/${resourceSlug}`;

  return { siteUrl, resource };
}

export function meta({ data }: Route.MetaArgs) {
  let { siteUrl, resource } = data;
  if (!resource) {
    return [{ title: "404 Not Found | Remix" }];
  }

  let socialImageUrl = resource.imgSrc;

  return getMeta({
    title: resource.title + " | Remix Resources",
    description: resource.description,
    siteUrl,
    image: socialImageUrl,
  });
}

export default function ResourcePage({ loaderData }: Route.ComponentProps) {
  let {
    description,
    repoUrl,
    initCommand,
    sponsorUrl,
    starsFormatted,
    tags,
    readmeHtml,
  } = loaderData.resource;

  return (
    <main className="flex flex-1 flex-col items-center px-8 lg:container">
      <div className="flex w-full flex-col md:flex-row-reverse">
        {/* The sidebar comes first with a flex row-reverse for better keyboard navigation */}
        <aside className="flex flex-col gap-4 md:sticky md:top-28 md:h-0 md:w-[400px]">
          <a
            href={repoUrl}
            rel="noopener noreferrer"
            target="_blank"
            className="text-xl font-bold hover:text-gray-600 dark:hover:text-gray-300"
          >
            {repoUrl.replace("https://github.com/", "")}
          </a>
          <p className="text-sm italic text-gray-500 dark:text-gray-300 md:text-justify lg:text-base">
            {description}
          </p>
          <a
            href={repoUrl}
            rel="noopener noreferrer"
            target="_blank"
            className="group flex items-center gap-2"
          >
            <svg
              aria-hidden
              className="h-4 w-4 text-gray-900 dark:text-gray-400"
              viewBox="0 0 24 24"
            >
              <use href={`${iconsHref}#github`} />
            </svg>
            <span>
              <span className="font-medium group-hover:font-semibold">
                Star
              </span>{" "}
              <span className="font-light group-hover:font-normal">
                {starsFormatted}
              </span>
            </span>
          </a>
          {sponsorUrl ? (
            <a
              href={sponsorUrl}
              rel="noopener noreferrer"
              target="_blank"
              className="flex items-center gap-2 font-medium hover:font-semibold"
            >
              <svg aria-hidden className="h-4 w-4" viewBox="0 0 16 16">
                <use href={`${iconsHref}#heart-filled`} />
              </svg>
              <span>Sponsor</span>
            </a>
          ) : null}
          <InitCodeblock initCommand={initCommand} />
          <div className="flex w-full max-w-full flex-wrap gap-x-2 gap-y-2">
            {tags.map((tag) => (
              <ResourceTag key={tag} value={tag}>
                {tag}
              </ResourceTag>
            ))}
          </div>
        </aside>

        <hr className="mt-6 w-full border-gray-200 dark:border-gray-700 md:hidden" />

        {readmeHtml ? (
          <div
            // Have to specify the width this way, otherwise the markdown
            // content will take up the full container without a care in the
            // world for it's sibling -- not unlike my older brother on our
            // family's annual summer road trip to the beach.
            className="markdown mt-6 w-full pr-0 md:mt-0 md:w-[calc(100%-400px)] md:pr-12 lg:pr-16"
          >
            <div
              className="md-prose"
              dangerouslySetInnerHTML={{ __html: readmeHtml }}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}
