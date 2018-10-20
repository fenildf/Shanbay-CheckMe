/*
 * @Author: VoldikSS
 * @Date: 2018-10-15 16:02:13
 * @Last Modified by: VoldikSS
 * @Last Modified time: 2018-10-20 09:26:19
 */

// Todo: 提醒打卡，入口做在popup页面内，https://www.shanbay.com/team/members/#p1

!function () {
    // get members table
    let members_table = document.getElementById("members");
    let members_table_body = document.querySelector("#members tbody");

    // create members table
    let dispel_members_table = document.createElement("table");
    dispel_members_table.setAttribute("id", "dispel_members");
    dispel_members_table.setAttribute("class", "table table-bordered");
    dispel_members_table.appendChild(document.querySelector("#members thead").cloneNode(true));
    document.getElementById("dismiss_container").insertBefore(dispel_members_table, members_table);

    // create tbody
    let dispel_members_table_body = document.createElement("tbody");
    dispel_members_table.appendChild(dispel_members_table_body);

    // table title
    let dispel_members_table_title = document.createElement("caption");
    dispel_members_table_title.innerText = "续命失败，-1s!!!";
    dispel_members_table.insertBefore(dispel_members_table_title, document.querySelector("#dispel_members tbody")[0]);

    // get the number of pages
    let pagination = document.getElementsByClassName("pagination")[0];
    let pages = pagination.getElementsByClassName("endless_page_link");
    let page_number = parseInt(pages[pages.length - 2].innerHTML);

    // loading page
    let loading = document.createElement("div");
    loading.setAttribute("id", "loading_container");
    loading.innerHTML = "<h1>正在续命，请稍后......</h1>";
    document.body.appendChild(loading);

    // create button: Check Me!
    let check_btn = document.createElement("button");
    check_btn.innerText = "一键查卡";
    check_btn.setAttribute("id", "check_btn");
    check_btn.addEventListener("click", CheckMe);
    document.querySelector(".page-header").appendChild(check_btn);

    // check and check, check every one!!!
    function CheckMe() {
        // Loading
        let loading = document.getElementById("loading_container");
        loading.style.display = "block";

        // display dispel members table
        dispel_members_table.style.display = "table";

        // restore the expire contents
        members_table_body.innerHTML = "";
        dispel_members_table_body.innerHTML = "";

        // Post(page_number);
        Post(page_number);
    }

    /**
     * @return {boolean}
     */
    // group living rule
    function DispelQ(role, days, rate, checked1, checked2) {
        if (role !== "2") {
            return false;
        }
        else if (parseInt(days) <= 3) {
            return (checked1 === "未打卡");
        }
        else if (parseInt(days) <= 7) {
            return (checked1 === "未打卡" && checked2 === "未打卡")
        }
        else if (parseFloat(rate) < 85.0) {
            return true;
        }
        else if (parseFloat(rate) < 95.0) {
            return (checked1 === "未打卡" && checked2 === "未打卡")
        }
        return false;
    }

    /**
     * @return {number}
     */
    // use recursion here
    function Post(page_index) {
        if (page_index === 0) {
            // hide the loading page, maybe some improvements...
            document.getElementById("loading_container").style.display = "none";
            // remove pagination at the bottom
            if (document.getElementsByClassName("pagination").length !== 0) {
                pagination.parentNode.removeChild(pagination);
            }
            return 1;
        }
        else {
            let req = new XMLHttpRequest();
            let url = "https://www.shanbay.com/team/manage/?page=" + page_index.toString();
            req.open("GET", url, true);
            req.responseType = "document";
            req.send();
            req.onreadystatechange = function () {
                if (req.status === 200 && req.readyState === 4) {
                    let members = req.response.querySelector("#members tbody").rows;
                    for (let member of members) {
                        role = member.getAttribute("role");
                        days = member.children[2].innerText.trim();
                        rate = member.children[3].innerText.trim();
                        checked1 = member.children[4].innerText.trim();
                        checked2 = member.children[5].innerText.trim();
                        if (DispelQ(role, days, rate, checked1, checked2)) {
                            dispel_members_table_body.appendChild(member.cloneNode(true));
                        }
                        members_table_body.appendChild(member.cloneNode(true));
                    }
                    page_index--;
                    // setTimeout()...?
                    Post(page_index);
                }
            }
        }
    }
}();

