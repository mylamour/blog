#coding:utf-8
import os
from github import Github

articles_path = "./_posts"
readme_path = "./readme.md"
access_token = ""


def write_readme(article):
    with open(readme_path,'a',encoding="utf-8") as out:  
        out.write(article)
        out.write("\n")


def get_issues_articals():
    g = Github(access_token)
    repo = g.get_repo("mylamour/blog")

    for artical_issue in repo.get_issues():
        access_url = artical_issue.html_url
        article_title = artical_issue.title
        article = "* [{}]({})".format(article_title,access_url)
        write_readme(article)

def get_posts_articals():
    for item in reversed(os.listdir(articles_path)):
        article_path = os.path.join(articles_path,item)
        with open(article_path,"rb") as art:
            title_line = str(art.readlines()[2], "utf8", errors="ignore")
            article_title = title_line.split(":")[1].strip('\r\n ')
            # timestamp = "-".join(item.split("-")[:3])
            artical_url = "-".join(item.split("-")[3:]).split(".md")[0]
            article = "* [{}]({}/{})".format(article_title,"https://iami.xyz",artical_url)
            write_readme(article)

if __name__ == "__main__":
    # get_issues_articals()
    get_posts_articals()