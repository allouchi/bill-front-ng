import { Injectable, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class I18nService implements OnInit {
    private defaultLang = 'fr';

    constructor(private translateService: TranslateService) {
    }

    ngOnInit(): void {
        // Définir la langue par défaut
        this.translateService.setFallbackLang(this.defaultLang);
        // Utiliser la langue du navigateur si disponible, sinon la langue par défaut
        const browserLang = this.translateService.getBrowserLang();
        this.translateService.use(browserLang ?? this.defaultLang);
    }

    /**
     * Changer la langue dynamiquement
     * @param lang code de la langue (ex: 'en', 'fr')
     */
    switchLang(lang: string) {
        this.translateService.use(lang);
    }


    /**
     * Récupérer la traduction d’une clé
     * @param key clé de traduction (ex: 'alert.deleteMessageF')
     */
    getTranslation(key: string) {
        return this.translateService.get(key);
    }
}
