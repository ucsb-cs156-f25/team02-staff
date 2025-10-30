import React from "react";
import ArticleForm from "main/components/Articles/ArticleForm";
import { articlesFixtures } from "fixtures/articlesFixtures";

export default {
  title: "components/Articles/ArticleForm",
  component: ArticleForm,
};

const Template = (args) => {
  return <ArticleForm {...args} />;
};

export const Create = Template.bind({});

Create.args = {
  buttonLabel: "Create",
  submitAction: (data) => {
    console.log("Submit was clicked with data: ", data);
    window.alert("Submit was clicked with data: " + JSON.stringify(data));
  },
};

export const Update = Template.bind({});

Update.args = {
  initialContents: articlesFixtures.oneArticle,
  buttonLabel: "Update",
  submitAction: (data) => {
    console.log("Submit was clicked with this data: ", data);
    window.alert("Submit was clicked with this data: " + JSON.stringify(data));
  },
};
