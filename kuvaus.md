# Päivystyskalenterin ja päivystysilmoitusten kehittäminen

**HACKATHON | YLE-PÄIVYSTYS**

# Tavoite

Yksi yhtenäinen sähköinen prosessi, jossa päivystysvuoron varaaminen, toteutuneiden vuorojen ilmoittaminen, korvausten käsittely ja raportointi perustuvat samaan, kerran syötettyyn tietoon.

# 1. Nykytila

YLE-päivystyksessä on käytössä sähköinen päivystyskalenteri. Lääkärit näkevät kalenterista vapaat vuorot ja voivat varata niitä itse. Vuoron jälkeen ilmoitus- ja korvaustiedot käsitellään kuitenkin erillisessä prosessissa, jossa käytetään paperisia päivystysilmoituksia ja manuaalista tietojen syöttämistä Exceliin.

## Nykyinen toimintatapa lyhyesti

1. Lääkäri varaa päivystysvuoron sähköisestä kalenterista.

![kalenteri](kalenteri.png)



2. Vuoron jälkeen lääkäri täyttää erillisen Excel-päivystysilmoituksen.

![nayttokuva1](nayttokuva1.png)

![nayttokuva2](nayttokuva2.png)

![nayttokuva3](nayttokuva3.png)

3. Ilmoitus tulostetaan ja palautetaan fyysiseen postilaatikkoon. Tulostusongelmissa ilmoituksia toimitetaan myös sähköpostin liitteinä.

4. Klinikkasihteeri vertaa ilmoitusta päivystyskalenteriin sekä tarkistaa päivämäärän, hoitolinjan, kellonajat, uraportaan ja muut korvaukseen vaikuttavat tiedot.

5. Korvaustiedot siirretään käsin kuukausittaiseen Excel-listaan ja toimitetaan turvapostilla palkanmaksuun.

## Nykyisessä mallissa toimivaa

- Päivystäjät voivat nähdä vapaat vuorot ja varata niitä itse.

- Kalentereihin on sisäinen reitti Polku-intrasta ja erillinen reitti ulkopuolisille käyttäjille.

- Nykyinen itsevarausmalli on käyttäjille pääosin tuttu.

# 2. Keskeiset nykyongelmat

## Sama tieto käsitellään useasti

Vuoron tiedot ovat ensin kalenterissa, sitten ilmoituksessa ja sen jälkeen ne syötetään käsin Excel-listalle. Päällekkäinen kirjaaminen lisää työtä ja virheriskiä.

## Paperinen päivystysilmoitus

Ilmoituksia voi puuttua, ne voivat tulla myöhässä tai niitä joudutaan etsimään ja täydentämään jälkikäteen.

## Lomake- ja käyttöongelmat

Päivystysilmoitus ei avaudu täytettäväksi kaikille käyttäjille, koska sen käyttö vaatii laajemman Microsoft-lisenssin ja näitä joudutaan joissakin tapauksissa pyytämään erikseen. Lisäksi käytössä voi olla vanhoja lomakeversioita, jos käyttäjä on tallentanut lomakkeen itselleen tai valitsee siirtymävaiheessa vanhan lomakkeen. Tämä voi johtaa siihen, että ilmoituksia tehdään eri versioilla ja tiedot eivät ole ajan tasalla.

## Virheelliset tai puutteelliset tiedot

Tyypillisiä puutteita ovat päivämäärä, alku- ja loppuaika, hoitolinja, virheellisesti merkityt valinnat, uraporras tai ristiriita ilmoituksen ja kalenterivarauksen välillä.

## Poikkeuskorvaukset

Hälytysrahalle, ruuhkanpurulle ja muille poikkeuksille ei ole omia selkeitä kenttiä. Tieto kirjataan lisätietoihin, jolloin sitä joudutaan tulkitsemaan.

## Käyttöoikeudet

Kun tunnukset, sopimukset tai käyttäjäryhmä muuttuvat, pääsy kalenteriin tai lomakkeelle ei aina toimi. Esimerkiksi amanuenssien käyttöoikeudet voivat vaatia erillistä selvittelyä. Sama henkilö voi toimia yhdessä yksikössä amanuenssina ja päivystyksessä lääketieteen opiskelijana, jolloin käyttöoikeudet eivät välttämättä vastaa päivystyksen tarvetta.

## Ylläpitovastuut

Kalenterien, käyttöoikeuksien, linkkien, lomakkeiden ja ohjeiden ylläpidon vastuut eivät ole täysin selkeitä. Tämä tekee myös kalenterimuutosten tekemisestä hankalaa.

## Tietosuoja

Paperiset ilmoitukset sisältävät henkilötietoja ja myös henkilötunnuksia. Fyysiseen käsittelyyn liittyy katoamisen tai väärälle henkilölle päätymisen riski.

## Tilastointi

Toiminta- ja korvaustietoja kootaan käsin, mikä vaikeuttaa ajantasaista seurantaa ja raportointia.

# 3. Tavoiteltu toimintamalli

## Toiminnan eteneminen

1\. Lääkäri varaa vuoron kalenterista.

2\. Vuoron perustiedot siirtyvät automaattisesti päivystysilmoitukselle.

3\. Lääkäri täydentää vain toteutuneet tiedot ja mahdolliset poikkeukset.

4\. Ilmoitus tarkistetaan ja hyväksytään sähköisesti.

5\. Hyväksytyt tiedot siirtyvät korvausten käsittelyyn ja raportointiin.

# 4. Ratkaisun keskeiset vaatimukset

## Päivystyskalenteri

- Vapaat vuorot ja omat varaukset näkyvät selkeästi.

- Päivystäjä voi varata vuoron itse.

- Ratkaisu toimii sekä sisäisille että ulkopuolisille käyttäjille.

- Ylläpitäjä voi vaihtaa, perua, lukita tai siirtää vuoron hallitusti.

- Muutoksista jää tapahtumaloki.

- Käyttöoikeudet kalenteriin eivät saa olla sidoksissa työsopimukseen, koska vuoroja voi varata neljä kuukautta eteenpäin.

## Sähköinen päivystysilmoitus

- Ilmoitus muodostuu varatun vuoron perusteella.

- Kalenterin perustiedot siirtyvät automaattisesti ilmoitukselle.

- Lääkäri täydentää vain toteutuneet tiedot.

- Pakolliset tiedot tarkistetaan ennen lähettämistä.

- Hälytysrahalle, ruuhkanpurulle ja muille poikkeuksille on omat selkeät kentät.

- Vanhentunutta lomakeversiota ei voi käyttää.

- Ilmoitus voidaan palauttaa korjattavaksi, ja hyväksytty ilmoitus voidaan lukita.

- Käsittely, laskenta ja raportointi perustuvat samaan rakenteiseen tietoon.

- Puuttuvat ja keskeneräiset ilmoitukset näkyvät käsittelijälle.

- Käsittelytila näkyy selkeästi, esimerkiksi luonnos, lähetetty, korjattavana, hyväksytty tai toimitettu.

- Korvaussäännöt päivitetään keskitetysti.

- Hyväksytyt tiedot voidaan siirtää palkanmaksuun ilman uudelleenkirjausta.

- Kuukausi- ja vuosiraportit muodostuvat valmiiksi rakenteisesta tiedosta tai ainakin helpottavat tarvittavien raporttien luomista.

# 5. Odotettavat hyödyt

- **Vähemmän käsityötä**: tietoa ei tarvitse syöttää useaan järjestelmään.

- **Vähemmän virheitä**: puutteet havaitaan jo ilmoitusta tehtäessä.

- **Parempi tietoturva**: paperisten henkilötietoasiakirjojen käsittely vähenee.

- **Ajantasainen raportointi**: tiedot ovat valmiiksi rakenteisessa muodossa.

# 6. Ratkaistavat kysymykset

- Mitä tietoja päivystysilmoitukseen voidaan tuoda automaattisesti kalenterista, henkilöstöportaalista tai muusta järjestelmästä, ja mitä tietoja lääkäri täydentää itse? Jos kaikkia tietoja ei saada automaattisesti, voidaanko ne tallentaa käyttäjän tietoihin niin, että päivystäjä voi tarvittaessa päivittää esimerkiksi varsinaisen työskentely-yksikkönsä itse?

- Miten käyttöoikeus kalenteriin ja lomakkeelle myönnetään, ja miten varmistetaan, että käyttäjä näkee vain hänelle kuuluvat tiedot?

- Missä korvaussääntöjä ylläpidetään ja miten muutokset tulevat voimaan?

- Kuka omistaa kalenterin, käyttöoikeudet, lomakkeet, ohjeet ja hyväksyntäprosessin, ja kuka tekee tarvittaessa muutokset kalenteriin/ilmoitukseen?

- Miten hyväksytyt tiedot siirtyvät palkanmaksuun?

- Toteutetaanko muutos vaiheittain vai korvataanko nykyinen kokonaisuus kerralla?

