<?php
/**
 * sysPass
 *
 * @author nuxsmin
 * @link http://syspass.org
 * @copyright 2012-2017, Rubén Domínguez nuxsmin@$syspass.org
 *
 * This file is part of sysPass.
 *
 * sysPass is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * sysPass is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 *  along with sysPass.  If not, see <http://www.gnu.org/licenses/>.
 */

namespace SP\Mgmt\PublicLinks;

defined('APP_ROOT') || die();

use SP\Config\Config;
use SP\Core\Crypt;
use SP\Core\Exceptions\SPException;
use SP\Core\SessionUtil;
use SP\DataModel\PublicLinkData;
use SP\Mgmt\ItemBase;
use SP\DataModel\PublicLinkBaseData;

/**
 * Class PublicLinks para la gestión de enlaces públicos
 *
 * @package SP
 */
abstract class PublicLinkBase extends ItemBase
{
    /** @var PublicLinkData */
    protected $itemData;

    /**
     * Category constructor.
     *
     * @param PublicLinkData $itemData
     * @throws \SP\Core\Exceptions\InvalidClassException
     */
    public function __construct($itemData = null)
    {
        if (!$this->dataModel) {
            $this->setDataModel(PublicLinkBaseData::class);
        }

        parent::__construct($itemData);
    }

    /**
     * @return PublicLinkData
     */
    public function getItemData()
    {
        return parent::getItemData();
    }

    /**
     * Devolver la clave y el IV para el enlace
     *
     * @throws SPException
     */
    protected final function createLinkPass()
    {
        $pass = Crypt::generateAesKey($this->createLinkHash());
        $cryptPass = Crypt::encryptData(SessionUtil::getSessionMPass(), $pass);

        $this->itemData->setPass($cryptPass['data']);
        $this->itemData->setPassIV($cryptPass['iv']);
    }

    /**
     * Generar el hash para el enlace
     *
     * @param bool $refresh Si es necesario regenerar el hash
     * @return string
     */
    protected final function createLinkHash($refresh = false)
    {
        if ($refresh === true
            || $this->itemData->getLinkHash() === ''
        ) {
            $hash = hash('sha256', uniqid('sysPassPublicLink', true));

            $this->itemData->setPublicLinkHash($hash);
            $this->itemData->setLinkHash($hash);
        }

        return $this->itemData->getLinkHash();
    }

    /**
     * Devolver el tiempo de caducidad del enlace
     *
     * @return int
     */
    protected final function calcDateExpire()
    {
        $this->itemData->setDateExpire(time() + (int)Config::getConfig()->getPublinksMaxTime());
    }

    /**
     * Actualizar la información de uso
     *
     * @param string $who Quién lo ha visto
     */
    protected final function updateUseInfo($who)
    {
        $this->itemData->addUseInfo(['who' => $who, 'time' => time()]);
    }
}