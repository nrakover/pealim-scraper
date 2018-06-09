  
  const request = require("request")
  const cheerio = require('cheerio')

  const PEALIM_BASE_URL = "https://www.pealim.com"
  const SEARCH_QUERY_SUFFIX = "/search/?q="

  function getVerbConjugationsUrl(html) {
    const $ = cheerio.load(html)
    const verbResult = $('div.results-by-verb').find($('.verb-search-result')).first()
    const button = $(verbResult).find('a.btn.btn-primary')
    const relativeLink = button.attr('href')
    return PEALIM_BASE_URL + relativeLink
  }

  function getConjugation($, cell) {
      const hebrew = $(cell).find('span.menukad').text()
      const transliteration = $(cell).find('div.transcription').html()
      const meaning = $(cell).find('div.meaning').html()
      return {
          hebrew: hebrew,
          transliteration: transliteration,
          meaning: meaning
      }
  }

  function getPresentTense($, table) {
      const masculineSingular = getConjugation($, $(table).find('#AP-ms'))
      const feminineSingular = getConjugation($, $(table).find('#AP-fs'))
      const masculinePlural = getConjugation($, $(table).find('#AP-mp'))
      const femininePlural = getConjugation($, $(table).find('#AP-fp'))
      return {
          masculineSingular: masculineSingular,
          feminineSingular: feminineSingular,
          masculinePlural: masculinePlural,
          femininePlural: femininePlural
      }
  }

  function getPastTense($, table) {
    const firstPersonSingular = getConjugation($, $(table).find('#PERF-1s'))
    const firstPersonPlural = getConjugation($, $(table).find('#PERF-1p'))

    const secondPersonMasculineSingular = getConjugation($, $(table).find('#PERF-2ms'))
    const secondPersonFeminineSingular = getConjugation($, $(table).find('#PERF-2fs'))
    const secondPersonMasculinePlural = getConjugation($, $(table).find('#PERF-2mp'))
    const secondPersonFemininePlural = getConjugation($, $(table).find('#PERF-2fp'))

    const thirdPersonMasculineSingular = getConjugation($, $(table).find('#PERF-3ms'))
    const thirdPersonFeminineSingular = getConjugation($, $(table).find('#PERF-3fs'))
    const thirdPersonPlural = getConjugation($, $(table).find('#PERF-3p'))
    return {
        firstPersonSingular: firstPersonSingular,
        firstPersonPlural: firstPersonPlural,
        secondPersonMasculineSingular: secondPersonMasculineSingular,
        secondPersonFeminineSingular: secondPersonFeminineSingular,
        secondPersonMasculinePlural: secondPersonMasculinePlural,
        secondPersonFemininePlural: secondPersonFemininePlural,
        thirdPersonMasculineSingular: thirdPersonMasculineSingular,
        thirdPersonFeminineSingular: thirdPersonFeminineSingular,
        thirdPersonPlural: thirdPersonPlural
    }
  }

  function getFutureTense($, table) {
    const firstPersonSingular = getConjugation($, $(table).find('#IMPF-1s'))
    const firstPersonPlural = getConjugation($, $(table).find('#IMPF-1p'))

    const secondPersonMasculineSingular = getConjugation($, $(table).find('#IMPF-2ms'))
    const secondPersonFeminineSingular = getConjugation($, $(table).find('#IMPF-2fs'))
    const secondPersonMasculinePlural = getConjugation($, $(table).find('#IMPF-2mp'))

    const thirdPersonMasculineSingular = getConjugation($, $(table).find('#IMPF-3ms'))
    const thirdPersonFeminineSingular = getConjugation($, $(table).find('#IMPF-3fs'))
    const thirdPersonMasculinePlural = getConjugation($, $(table).find('#IMPF-3mp'))
    return {
        firstPersonSingular: firstPersonSingular,
        firstPersonPlural: firstPersonPlural,
        secondPersonMasculineSingular: secondPersonMasculineSingular,
        secondPersonFeminineSingular: secondPersonFeminineSingular,
        secondPersonMasculinePlural: secondPersonMasculinePlural,
        thirdPersonMasculineSingular: thirdPersonMasculineSingular,
        thirdPersonFeminineSingular: thirdPersonFeminineSingular,
        thirdPersonMasculinePlural: thirdPersonMasculinePlural
    }
  }

  function getInfinitive($, table) {
      return getConjugation($, $(table).find('#INF-L'))
  }

  function scrapeConjugations(html) {
    const $ = cheerio.load(html)
    const conjugationsTable = $('table.conjugation-table').first()
    
    const present = getPresentTense($, conjugationsTable)
    const past = getPastTense($, conjugationsTable)
    const future = getFutureTense($, conjugationsTable)
    const infinitive = getInfinitive($, conjugationsTable)

    return {
        present: present,
        past: past,
        future: future,
        infinitive: infinitive
    }
  }

  function processHtml(html, res) {
      const conjugationsUrl = getVerbConjugationsUrl(html)
      request(conjugationsUrl, function (error, response, body) {
        if (error) {
            res.status(400).send(('error:', error)); // Print the error if one occurred
            return;
        }
        console.log('conjugations endpoint:', response && response.statusCode); // Print the response status code if a response was received
        
        const conjugations = scrapeConjugations(body)
        res.status(200).send(conjugations)
    });
  }
  
  /**
   * Makes a request to the pealim site and parses the response for the verb conjugations.
   *
   * @param {!Object} req Cloud Function request context.
   * @param {!Object} res Cloud Function response context.
   */
  exports.scrapeConjugations = (req, res) => {
    if (req.body.query === undefined) {
        // This is an error case, as "query" is required
        res.status(400).send('No query defined!');
        return;
    }

    const queryUrl = encodeURI(PEALIM_BASE_URL + SEARCH_QUERY_SUFFIX + req.body.query)
    request(queryUrl, function (error, response, body) {
        if (error) {
            res.status(400).send(('error:', error)); // Print the error if one occurred
            return;
        }
        console.log('search endpoint:', response && response.statusCode); // Print the response status code if a response was received
        
        processHtml(body, res)
    });
  };
  