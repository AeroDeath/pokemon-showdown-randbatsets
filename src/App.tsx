import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Search, Moon, Sun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';

type PokemonData = {
  [key: string]: any;
};

type BattleTypeData = {
  [key: string]: PokemonData;
};

const showdownRandbatsTypesLink = "https://pkmn.github.io/randbats/data/";
const defaultEVs = 84;
const defaultIVs = 31;

const App: React.FC = () => {
  const [battleTypes, setBattleTypes] = useState<string[]>([]);
  const [selectedBattleType, setSelectedBattleType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null);
  const [pokemonData, setPokemonData] = useState<BattleTypeData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<boolean>(true);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const dropdownRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(showdownRandbatsTypesLink);
        const data = await response.json();
        setBattleTypes(Object.keys(data));

        const battleTypeData: BattleTypeData = {};
        for (const battleType of Object.keys(data)) {
          const battleResponse = await fetch(showdownRandbatsTypesLink + battleType);
          battleTypeData[battleType] = await battleResponse.json();
        }
        setPokemonData(battleTypeData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : '';
  }, [darkMode]);

  const handleBattleTypeChange = (value: string) => {
    setSelectedBattleType(value);
    setSelectedPokemon(null);
    setSearchTerm('');
    setShowDropdown(true);
    setFocusedIndex(-1);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setShowDropdown(true);
    setFocusedIndex(-1);
  };

  const handlePokemonSelect = (pokemon: string) => {
    setSelectedPokemon(pokemon);
    setShowDropdown(false);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => (prev < filteredPokemon.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredPokemon.length) {
          handlePokemonSelect(filteredPokemon[focusedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        break;
    }
  };

  useEffect(() => {
    if (dropdownRef.current && focusedIndex >= 0) {
      const focusedElement = dropdownRef.current.children[focusedIndex] as HTMLElement;
      focusedElement.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex]);

  const filteredPokemon = selectedBattleType && pokemonData[selectedBattleType]
    ? Object.keys(pokemonData[selectedBattleType]).filter(pokemon =>
        pokemon.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const renderEVsIVs = (data: any) => {
    const evs = data.evs || {};
    const ivs = data.ivs || {};
    const changedEVs = Object.entries(evs).filter(([stat, value]) => value !== defaultEVs);
    const changedIVs = Object.entries(ivs).filter(([stat, value]) => value !== defaultIVs);

    return (
      <>
        {changedEVs.length > 0 && (
          <div className="mb-2">
            <strong>EVs:</strong>
            <ul className="list-disc pl-5">
              {changedEVs.map(([stat, value]) => (
                <li key={stat}>{stat.toUpperCase()}: {value as string}</li>
              ))}
            </ul>
          </div>
        )}
        {changedIVs.length > 0 && (
          <div className="mb-2">
            <strong>IVs:</strong>
            <ul className="list-disc pl-5">
              {changedIVs.map(([stat, value]) => (
                <li key={stat}>{stat.toUpperCase()}: {value as string}</li>
              ))}
            </ul>
          </div>
        )}
      </>
    );
  };

  const renderPokemonData = (data: any) => {
    const abilities = data.abilities || [];
    const items = data.items || [];
    const moves = data.moves || [];
    const teraTypes = data.teraTypes || [];

    const otherInfo = Object.entries(data).filter(([key, value]) => 
      !(['level', 'abilities', 'items', 'moves', 'teraTypes', 'evs', 'ivs'].includes(key))
    );

    return (
      <>
        <div className="mb-2">
          <strong>Abilities:</strong> {abilities.join(', ')}
        </div>
        <div className="mb-2">
          <strong>Items:</strong> {items.join(', ')}
        </div>
        <div className="mb-2">
          <strong>Movepool:</strong>
          <ul className="list-disc pl-5">
            {moves.map((move: string) => <li key={move}>{move}</li>)}
          </ul>
        </div>
        {teraTypes.length > 0 && (
          <div className="mb-2">
            <strong>Tera Types:</strong> {teraTypes.join(', ')}
          </div>
        )}
        {renderEVsIVs(data)}
        {console.log(otherInfo)}
        {otherInfo.length > 0 && (
          <AccordionItem value="other">
            <AccordionTrigger>Other Information</AccordionTrigger>
            <AccordionContent>
              {otherInfo.map(([key, value]) => (
                <div key={key} className="mb-2">
                  <strong>{key}:</strong> {
                    typeof value === 'object' 
                      ? <div className="pl-4">{JSON.stringify(value, null, 2)}</div>
                      : String(value)
                  }
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        )}
      </>
    );
  };

  const renderAccordionContent = (pokemonInfo: any) => {
    if (pokemonInfo.roles) {
      return Object.entries(pokemonInfo.roles).map(([role, roleData]: [string, any]) => (
        <AccordionItem value={role} key={role}>
          <AccordionTrigger>{role}</AccordionTrigger>
          <AccordionContent>
            {renderPokemonData(roleData)}
          </AccordionContent>
        </AccordionItem>
      ));
    } else {
      return (
        <AccordionItem value="default">
          <AccordionTrigger>Default Moveset</AccordionTrigger>
          <AccordionContent>
            {renderPokemonData(pokemonInfo)}
          </AccordionContent>
        </AccordionItem>
      );
    }
  };

  const formatBattleType = (type: string) => {
    return type.replace('.json', '');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={`container mx-auto p-4 ${darkMode ? 'dark' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Pokemon Showdown Random Battle Moveset Viewer</h1>
        <div className="flex items-center">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <Switch
            checked={darkMode}
            onCheckedChange={setDarkMode}
            className="ml-2"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <Select onValueChange={handleBattleTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a battle type" />
          </SelectTrigger>
          <SelectContent>
            {battleTypes.map(type => (
              <SelectItem key={type} value={type}>{formatBattleType(type)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedBattleType && (
        <div className="mb-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for a Pokemon"
              value={searchTerm}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          {showDropdown && (
            <ul ref={dropdownRef} className="mt-2 max-h-60 overflow-auto bg-white dark:bg-gray-800">
              {filteredPokemon.map((pokemon, index) => (
                <li
                  key={pokemon}
                  onClick={() => handlePokemonSelect(pokemon)}
                  className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 ${index === focusedIndex ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
                >
                  {pokemon}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {selectedPokemon && selectedBattleType && pokemonData[selectedBattleType][selectedPokemon] && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row items-center justify-between">
              <span>{selectedPokemon}</span>
              <span>Level: {pokemonData[selectedBattleType][selectedPokemon].level}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-4">
              <img 
                src={`https://play.pokemonshowdown.com/sprites/ani/${selectedPokemon.toLowerCase()}.gif`}
                alt={selectedPokemon}
                className="w-32 h-32 object-contain mb-4"
              />
              <Accordion type="single" collapsible className="w-full">
                {renderAccordionContent(pokemonData[selectedBattleType][selectedPokemon])}
              </Accordion>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default App;