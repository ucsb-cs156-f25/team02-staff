import React from "react";
import ArticleTable from "main/components/Articles/ArticleTable";
import { articlesFixtures } from "fixtures/articlesFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "components/Articles/ArticleTable",
  component: ArticleTable,
};

const Template = (args) => {
  return <ArticleTable {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  articles: [],
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.args = {
  articles: articlesFixtures.threeArticles,
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
  articles: articlesFixtures.threeArticles,
  currentUser: currentUserFixtures.adminUser,
};

ThreeItemsAdminUser.parameters = {
  msw: [
    http.delete("/api/articles", () => {
      return HttpResponse.json(
        { message: "Article deleted successfully" },
        { status: 200 },
      );
    }),
  ],
};
