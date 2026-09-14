"use client";

import {
  Download,
  Search,
  X,
} from "lucide-react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  FormEvent,
  useState,
} from "react";

type CountryOption = {
  code: string;
  name: string;
};

export function AttendeeFilters({
  countries,
}: {
  countries:
    CountryOption[];
}) {
  const router =
    useRouter();

  const params =
    useSearchParams();

  const [search, setSearch] =
    useState(
      params.get("q") ??
        ""
    );

  function navigate(
    updates:
      Record<
        string,
        string
      >
  ) {
    const next =
      new URLSearchParams(
        params.toString()
      );

    for (
      const [
        key,
        value,
      ] of Object.entries(
        updates
      )
    ) {
      if (
        !value ||
        value ===
          "all"
      ) {
        next.delete(key);
      } else {
        next.set(
          key,
          value
        );
      }
    }

    next.delete(
      "page"
    );

    const query =
      next.toString();

    router.push(
      query
        ? `/admin?${query}`
        : "/admin"
    );
  }

  function submit(
    event:
      FormEvent
  ) {
    event.preventDefault();

    navigate({
      q:
        search.trim(),
    });
  }

  function clear() {
    setSearch("");

    router.push(
      "/admin"
    );
  }

  return (
    <section className="mw-admin-filter-bar">
      <form
        onSubmit={submit}
      >
        <Search
          size={17}
        />

        <input
          type="search"
          value={search}
          onChange={(
            event
          ) =>
            setSearch(
              event.target
                .value
            )
          }
          placeholder="Search name, email, phone or reference"
        />

        {search ? (
          <button
            type="button"
            onClick={() =>
              setSearch("")
            }
            aria-label="Clear search text"
          >
            <X
              size={15}
            />
          </button>
        ) : null}

        <button
          type="submit"
        >
          Search
        </button>
      </form>

      <select
        value={
          params.get(
            "country"
          ) ?? "all"
        }
        onChange={(
          event
        ) =>
          navigate({
            country:
              event.target
                .value,
          })
        }
      >
        <option value="all">
          All nations
        </option>

        {countries.map(
          (country) => (
            <option
              key={
                country.code
              }
              value={
                country.code
              }
            >
              {country.name}
            </option>
          )
        )}
      </select>

      <select
        value={
          params.get(
            "mode"
          ) ?? "all"
        }
        onChange={(
          event
        ) =>
          navigate({
            mode:
              event.target
                .value,
          })
        }
      >
        <option value="all">
          All attendance
        </option>

        <option value="in_person">
          In person
        </option>

        <option value="livestream">
          Livestream
        </option>
      </select>

      <select
        value={
          params.get(
            "emailStatus"
          ) ?? "all"
        }
        onChange={(
          event
        ) =>
          navigate({
            emailStatus:
              event.target
                .value,
          })
        }
      >
        <option value="all">
          All email states
        </option>

        <option value="sent">
          Sent
        </option>

        <option value="pending">
          Pending
        </option>

        <option value="failed">
          Failed
        </option>

        <option value="skipped">
          Skipped
        </option>

        <option value="none">
          Not sent
        </option>
      </select>

      <a
        href={
          `/api/admin/registrations/export${
            params.toString()
              ? `?${params.toString()}`
              : ""
          }`
        }
        className="mw-admin-export-link"
      >
        <Download
          size={14}
        />

        Export CSV
      </a>

      <button
        type="button"
        onClick={
          clear
        }
        className="mw-admin-clear-filters"
      >
        Reset
      </button>
    </section>
  );
}
