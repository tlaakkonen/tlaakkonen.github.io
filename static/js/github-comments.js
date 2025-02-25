// use of ajax vs getJSON for headers use to get markdown (body vs body_htmml)
// todo: pages, configure issue url, open in new window?

var CurrentPage = 0;

function ParseLinkHeader(link)
{
    var links = { };
    if (link)
    {
        var entries = link.split(",");
        for (var i in entries)
        {
            var entry = entries[i];
            var link = { };
            link.name = entry.match(/rel=\"([^\"]*)/)[1];
            link.url = entry.match(/<([^>]*)/)[1];
            link.page = entry.match(/page=(\d+).*$/)[1];
            links[link.name] = link;
        }
    }
    return links;
}

function DoGithubComments(author_list, comment_id, page_id)
{
    var repo_name = "tlaakkonen/tlaakkonen.github.io";

    if (page_id === undefined)
        page_id = 1;

    var api_url = "https://api.github.com/repos/" + repo_name;
    var api_issue_url = api_url + "/issues/" + comment_id;
    var api_comments_url = api_url + "/issues/" + comment_id + "/comments" + "?page=" + page_id;
    var api_react_url = api_url + "/issues/comments/" 

    var url = "https://github.com/" + repo_name + "/issues/" + comment_id;

    $(document).ready(function ()
    {
        $.getJSON(api_issue_url, function(data) {
            NbComments = data.comments;
        });

        $.ajax(api_comments_url, {
            headers: {Accept: "application/vnd.github.v3.html+json"},
            dataType: "json",
            success: function(comments, textStatus, jqXHR) {

                // Add post button to first page
                if (page_id == 1)
                    $(" <a href='" + url + "#new_comment_field' target='_blank' rel='nofollow' id='gh-comments-btn'>Post a comment on Github</a>").insertAfter("#gh-comments-title");

                // Individual comments
                $.each(comments, function(i, comment) {

                    var date = new Date(comment.created_at);

                    var t = "<div class='gh-comment'>";
                    t += "<div class='gh-comment-header' id='gh-comment-header-id-" + comment.id + "'><img src='" + comment.user.avatar_url + "'>";
                    t += "<b><a href='" + comment.user.html_url + "'>" + comment.user.login + "</a></b>";
                    if (author_list.includes(comment.user.login)) {
                        t += " <span class='gh-comment-op-tag'>(author)</span>"
                    } else if (comment.author_association === 'OWNER') {
                        t += " <span class='gh-comment-op-tag'>(admin)</span>"
                    }
                    t += " posted at ";
                    t += "<em>" + date.toUTCString() + "</em></div>";
                    t += "<div class='gh-comment-content'>";
                    t += comment.body_html;
                    t += "</div></div>";
                    $("#gh-comments-list").append(t);
                });

                if (comments.length == 0) {
                    $("#gh-comments-list").append("There are no comments for this post.");
                }

                // Setup comments button if there are more pages to display
                var links = ParseLinkHeader(jqXHR.getResponseHeader("Link"));
                if ("next" in links)
                {
                    $("#gh-load-comments").attr("onclick", "DoGithubComments(" + JSON.stringify(author_list) + "," + comment_id + "," + (page_id + 1) + ");");
                    $("#gh-load-comments").show();
                }
                else
                {
                    $("#gh-load-comments").hide();
                }
            },
            error: function(xhr) {
                $("#gh-comments-list").append("Comments are not open for this post yet.");
            }
        });
    });
}