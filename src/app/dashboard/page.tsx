/*** Главная страница ***/
"use client";

import {signout} from "~/app/actions/auth";

export default function Page() {
    return (
        <div>
            <p>My dashboard</p>
            <button onClick={() => signout()}>Logout</button>
        </div>
    );
}
