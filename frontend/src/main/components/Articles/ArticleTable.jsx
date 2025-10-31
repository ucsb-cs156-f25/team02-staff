import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/articleUtils";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";

export default function ArticleTable({
  articles,
  currentUser,
  testIdPrefix = "ArticleTable",
}) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/articles/edit/${cell.row.original.id}`);
  };

  // Stryker disable all : hard to test for query caching

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/articles/all"],
  );
  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      header: "Id",
      accessorKey: "id", // accessor is the "key" in the data
    },

    {
      header: "Title",
      accessorKey: "title",
    },
    {
      header: "URL",
      accessorKey: "url",
    },
    {
      header: "Explanation",
      accessorKey: "explanation",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Date Added",
      accessorKey: "dateAdded",
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(ButtonColumn("Edit", "primary", editCallback, testIdPrefix));
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, testIdPrefix),
    );
  }

  return <OurTable data={articles} columns={columns} testid={testIdPrefix} />;
}
