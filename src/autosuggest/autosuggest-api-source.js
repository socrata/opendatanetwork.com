
class AutosuggestApiSource extends AutosuggestSource {

    get(term) {

        return new Promise((resolve, reject) => {

            const options = [{ 
                text: 'Show the Suggestions API documentation.',
                url: 'http://docs.odn.apiary.io/#reference/0/suggestions/get-suggestions',
            }];

            resolve(options);
        });
    }
}

