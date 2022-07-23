export interface DoublyLinkedLoopEntry<T> {
    prev: DoublyLinkedLoopEntry<T> | undefined;
    value: T;
    next: DoublyLinkedLoopEntry<T> | undefined;
}

export class DoublyLinkedLoop<T> {
    #entries = [] as DoublyLinkedLoopEntry<T>[];

    constructor(...entries: T[]) {
        this.#entries = entries.map((value) => ({
            prev: undefined,
            value,
            next: undefined,
        }));

        this.#entries.forEach((e, i) => {
            this.link(e, this.#entries[i + 1] ?? this.#entries[0]);
        });
    }

    first() {
        return this.#entries[0];
    }

    random() {
        return this.#entries[Math.floor(Math.random() * this.#entries.length)];
    }

    unlink(from: DoublyLinkedLoopEntry<T>, to: DoublyLinkedLoopEntry<T>, force?: true) {
        if ((!from.next || !to.prev || (from.next !== to.prev && from.next && to.prev)) && !force) {
            console.log("From: ", from);
            console.log("To:", to);

            throw new Error(
                `Cannot unlink entries as they are not linked properly. To dangerously force an unlink use the 'force' parameter.`
            );
        }

        from.next = undefined;
        to.prev = undefined;
    }

    link(from: DoublyLinkedLoopEntry<T>, to: DoublyLinkedLoopEntry<T>, force?: true) {
        if ((from.next || to.prev || (from.next === to.prev && from.next && to.prev)) && !force) {
            console.log("From: ", from);
            console.log("To:", to);

            throw new Error(
                `Cannot link entries as they are already linked. To dangerously force a link use the 'force' parameter.`
            );
        }

        from.next = to;
        to.prev = from;
    }
}
